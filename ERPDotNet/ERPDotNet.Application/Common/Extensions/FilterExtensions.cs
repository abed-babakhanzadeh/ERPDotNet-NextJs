using ERPDotNet.Application.Common.Models;
using System.Linq.Expressions;
using System.Reflection;

namespace ERPDotNet.Application.Common.Extensions;

public static class FilterExtensions
{
    public static IQueryable<T> ApplyDynamicFilters<T>(this IQueryable<T> query, List<FilterModel>? filters)
    {
        if (filters == null || !filters.Any())
            return query;

        foreach (var filter in filters)
        {
            if (string.IsNullOrEmpty(filter.Value)) continue;

            try
            {
                // 1. پیدا کردن پراپرتی (ستون)
                var parameter = Expression.Parameter(typeof(T), "x");
                var property = Expression.Property(parameter, filter.PropertyName);
                
                // 2. تبدیل مقدار رشته‌ای به نوع واقعی ستون (int, decimal, date, ...)
                var targetType = property.Type;
                // هندل کردن Nullable
                if (Nullable.GetUnderlyingType(targetType) != null)
                    targetType = Nullable.GetUnderlyingType(targetType);

                var convertedValue = Convert.ChangeType(filter.Value, targetType!);
                var constant = Expression.Constant(convertedValue, property.Type); // Constant باید هم‌تایپ Property باشد (حتی اگر Nullable)

                Expression comparison;

                // 3. ساخت دستور مقایسه بر اساس عملیات درخواستی
                switch (filter.Operation.ToLower())
                {
                    case "eq": // Equal (==)
                        comparison = Expression.Equal(property, constant);
                        break;
                    
                    case "neq": // Not Equal (!=)
                        comparison = Expression.NotEqual(property, constant);
                        break;

                    case "gt": // Greater Than (>)
                        comparison = Expression.GreaterThan(property, constant);
                        break;

                    case "gte": // Greater Than or Equal (>=)
                        comparison = Expression.GreaterThanOrEqual(property, constant);
                        break;

                    case "lt": // Less Than (<)
                        comparison = Expression.LessThan(property, constant);
                        break;

                    case "lte": // Less Than or Equal (<=)
                        comparison = Expression.LessThanOrEqual(property, constant);
                        break;

                    case "contains": // String Contains
                        if (property.Type == typeof(string))
                        {
                            var method = typeof(string).GetMethod("Contains", new[] { typeof(string) });
                            comparison = Expression.Call(property, method!, constant);
                        }
                        else
                        {
                            // برای اعداد نمیشه Contains زد، پس مساوی میگیریم
                            comparison = Expression.Equal(property, constant);
                        }
                        break;

                    default:
                        continue; // عملیات ناشناخته
                }

                // 4. ترکیب نهایی و اعمال روی کوئری
                var lambda = Expression.Lambda<Func<T, bool>>(comparison, parameter);
                query = query.Where(lambda);
            }
            catch
            {
                // اگر نام ستون اشتباه بود یا مقدار تبدیل نشد، فیلتر را نادیده بگیر (تا سیستم کرش نکند)
                continue; 
            }
        }

        return query;
    }
}