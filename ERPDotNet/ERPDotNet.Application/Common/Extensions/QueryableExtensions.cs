using ERPDotNet.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;
using System.Reflection;

namespace ERPDotNet.Application.Common.Extensions;

public static class QueryableExtensions
{
    public static Task<PaginatedResult<T>> ToPaginatedListAsync<T>(
        this IQueryable<T> source, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default)
    {
        return PaginatedResult<T>.CreateAsync(source, pageNumber, pageSize, cancellationToken);
    }

    /// <summary>
    /// سورتی که هم نال‌ها را مدیریت می‌کند (همیشه ته لیست) و هم اعداد داخل رشته‌ها را (Natural Sort)
    /// </summary>
    public static IQueryable<T> OrderByNatural<T>(this IQueryable<T> query, string orderByMember, bool descending)
    {
        var param = Expression.Parameter(typeof(T), "x");
        
        // 1. ساخت Expression برای دسترسی به پراپرتی تو در تو (Nested Property)
        Expression body = param;
        foreach (var member in orderByMember.Split('.'))
        {
            body = Expression.PropertyOrField(body, member);
        }

        // 2. بررسی وضعیت Nullable بودن
        bool isNullable = body.Type.IsClass || Nullable.GetUnderlyingType(body.Type) != null;
        
        IQueryable<T> orderedQuery = query;
        bool isOrdered = false;

        // 3. اگر Nullable است، ابتدا نال‌ها را به پایین لیست بفرست
        if (isNullable)
        {
            // x => x.Prop == null ? 1 : 0
            var nullCheckExpression = Expression.Condition(
                Expression.Equal(body, Expression.Constant(null)),
                Expression.Constant(1),
                Expression.Constant(0)
            );

            var nullCheckKeySelector = Expression.Lambda(nullCheckExpression, param);
            
            // همیشه برای نال چک از OrderBy (صعودی) استفاده می‌کنیم تا 0 (غیر نال) اول بیاید و 1 (نال) آخر
            var resultExpression = Expression.Call(
                typeof(Queryable),
                "OrderBy",
                new Type[] { typeof(T), typeof(int) },
                query.Expression,
                Expression.Quote(nullCheckKeySelector)
            );

            orderedQuery = query.Provider.CreateQuery<T>(resultExpression);
            isOrdered = true;
        }

        // 4. آماده‌سازی برای سورت اصلی (بر اساس مقدار)
        LambdaExpression keySelector;

        // اگر رشته است، لاجیک Collate (Natural Sort) را اعمال کن
        if (body.Type == typeof(string))
        {
            var efFunctions = Expression.Property(null, typeof(EF), nameof(EF.Functions));
            
            var genericCollateMethod = typeof(RelationalDbFunctionsExtensions)
                .GetMethods(BindingFlags.Static | BindingFlags.Public)
                .First(m => m.Name == nameof(RelationalDbFunctionsExtensions.Collate)
                            && m.GetParameters().Length == 3 
                            && m.GetParameters()[0].ParameterType == typeof(DbFunctions));

            var concreteCollateMethod = genericCollateMethod.MakeGenericMethod(typeof(string));

            var collateCall = Expression.Call(
                concreteCollateMethod,
                efFunctions, 
                body, 
                Expression.Constant("numeric") 
            );

            keySelector = Expression.Lambda(collateCall, param);
        }
        else
        {
            // سورت معمولی برای سایر تایپ‌ها
            keySelector = Expression.Lambda(body, param);
        }

        // 5. تعیین نام متد (OrderBy یا ThenBy)
        // اگر در مرحله نال چک سورت انجام شده باشد، اینجا باید ThenBy بزنیم
        string methodName;
        if (isOrdered)
        {
            methodName = descending ? "ThenByDescending" : "ThenBy";
        }
        else
        {
            methodName = descending ? "OrderByDescending" : "OrderBy";
        }

        // 6. اعمال سورت نهایی
        // نکته مهم: اگر isOrdered true باشد، نوع keySelector.Body.Type متفاوت است ولی جنریک متد هندل می‌کند
        var finalExpression = Expression.Call(
            typeof(Queryable),
            methodName,
            new Type[] { typeof(T), keySelector.ReturnType }, // استفاده از ReturnType برای هندل کردن string/collate و سایر تایپ‌ها
            orderedQuery.Expression,
            Expression.Quote(keySelector));

        return query.Provider.CreateQuery<T>(finalExpression);
    }
}