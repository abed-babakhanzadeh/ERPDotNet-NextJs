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

    public static IQueryable<T> OrderByNatural<T>(this IQueryable<T> query, string orderByMember, bool descending)
    {
        var param = Expression.Parameter(typeof(T), "x");
        
        Expression body = param;
        foreach (var member in orderByMember.Split('.'))
        {
            body = Expression.PropertyOrField(body, member);
        }

        if (body.Type == typeof(string))
        {
            var efFunctions = Expression.Property(null, typeof(EF), nameof(EF.Functions));
            
            // 1. پیدا کردن متد جنریک خام (Generic Definition)
            var genericCollateMethod = typeof(RelationalDbFunctionsExtensions)
                .GetMethods(BindingFlags.Static | BindingFlags.Public)
                .First(m => m.Name == nameof(RelationalDbFunctionsExtensions.Collate)
                            && m.GetParameters().Length == 3 
                            && m.GetParameters()[0].ParameterType == typeof(DbFunctions));

            // 2. ساختن متد برای نوع استرینگ (Collate<string>) --- این خط حیاتی است
            var concreteCollateMethod = genericCollateMethod.MakeGenericMethod(typeof(string));

            // 3. فراخوانی متد ساخته شده
            var collateCall = Expression.Call(
                concreteCollateMethod, // استفاده از متد کانکریت شده
                efFunctions, 
                body, 
                Expression.Constant("numeric") 
            );

            var keySelector = Expression.Lambda(collateCall, param);

            var method = descending ? "OrderByDescending" : "OrderBy";
            
            var resultExpression = Expression.Call(
                typeof(Queryable),
                method,
                new Type[] { typeof(T), typeof(string) },
                query.Expression,
                Expression.Quote(keySelector));

            return query.Provider.CreateQuery<T>(resultExpression);
        }
        else
        {
            var keySelector = Expression.Lambda(body, param);
            var method = descending ? "OrderByDescending" : "OrderBy";
            
            var resultExpression = Expression.Call(
                typeof(Queryable),
                method,
                new Type[] { typeof(T), body.Type },
                query.Expression,
                Expression.Quote(keySelector));

            return query.Provider.CreateQuery<T>(resultExpression);
        }
    }
}