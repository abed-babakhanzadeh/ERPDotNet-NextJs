using ERPDotNet.Application.Common.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq.Expressions;

namespace ERPDotNet.Application.Common.Extensions;

public static class QueryableExtensions
{
    public static async Task<PaginatedResult<T>> ToPaginatedListAsync<T>(
        this IQueryable<T> source, 
        int pageNumber, 
        int pageSize, 
        CancellationToken cancellationToken = default)
    {
        var count = await source.CountAsync(cancellationToken);
        
        var items = await source
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return new PaginatedResult<T>(items, count, pageNumber, pageSize);
    }

    // متد کمکی برای مرتب‌سازی داینامیک (چون نام ستون به صورت رشته می‌آید)
    public static IQueryable<T> OrderByDynamic<T>(this IQueryable<T> query, string orderByMember, bool descending)
    {
        var queryElementTypeParam = Expression.Parameter(typeof(T));
        
        // پیدا کردن پراپرتی با نام ارسال شده (مثلا "Code")
        var memberAccess = Expression.PropertyOrField(queryElementTypeParam, orderByMember);
        
        var keySelector = Expression.Lambda(memberAccess, queryElementTypeParam);

        var orderBy = descending ? "OrderByDescending" : "OrderBy";

        var result = Expression.Call(
            typeof(Queryable), 
            orderBy, 
            new Type[] { typeof(T), memberAccess.Type }, 
            query.Expression, 
            Expression.Quote(keySelector));

        return query.Provider.CreateQuery<T>(result);
    }
}