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
                var parameter = Expression.Parameter(typeof(T), "x");
                
                // Handle nested properties (e.g., "Product.Code")
                Expression propertyAccess;
                if (filter.PropertyName.Contains("."))
                {
                    var parts = filter.PropertyName.Split('.');
                    propertyAccess = Expression.PropertyOrField(parameter, parts[0]);
                    
                    foreach (var part in parts.Skip(1))
                    {
                        propertyAccess = Expression.PropertyOrField(propertyAccess, part);
                    }
                }
                else
                {
                    propertyAccess = Expression.Property(parameter, filter.PropertyName);
                }
                
                var targetType = Nullable.GetUnderlyingType(propertyAccess.Type) ?? propertyAccess.Type;

                object convertedValue;

                // هندل کردن خاص مقادیر بولی
                if (targetType == typeof(bool))
                {
                    if (bool.TryParse(filter.Value, out bool boolValue))
                    {
                        convertedValue = boolValue;
                    }
                    else
                    {
                        continue; // اگر مقدار "true" یا "false" نباشد، فیلتر را رد کن
                    }
                }
                else
                {
                    convertedValue = Convert.ChangeType(filter.Value, targetType);
                }

                var constant = Expression.Constant(convertedValue, propertyAccess.Type);
                Expression comparison;

                switch (filter.Operation.ToLower())
                {
                    case "equals":
                    case "eq":
                        comparison = Expression.Equal(propertyAccess, constant);
                        break;
                    
                    case "neq":
                        comparison = Expression.NotEqual(propertyAccess, constant);
                        break;

                    case "gt":
                        comparison = Expression.GreaterThan(propertyAccess, constant);
                        break;

                    case "gte":
                        comparison = Expression.GreaterThanOrEqual(propertyAccess, constant);
                        break;

                    case "lt":
                        comparison = Expression.LessThan(propertyAccess, constant);
                        break;

                    case "lte":
                        comparison = Expression.LessThanOrEqual(propertyAccess, constant);
                        break;

                    case "contains":
                        if (propertyAccess.Type == typeof(string))
                        {
                            var stringConstant = Expression.Constant(filter.Value, typeof(string));
                            var method = typeof(string).GetMethod("Contains", new[] { typeof(string) });
                            if (method != null)
                            {
                                comparison = Expression.Call(propertyAccess, method, stringConstant);
                            }
                            else
                            {
                                comparison = Expression.Equal(propertyAccess, constant);
                            }
                        }
                        else
                        {
                            // برای انواع دیگر، Contains معادل Equals است
                            comparison = Expression.Equal(propertyAccess, constant);
                        }
                        break;

                    default:
                        continue;
                }

                var lambda = Expression.Lambda<Func<T, bool>>(comparison, parameter);
                query = query.Where(lambda);
            }
            catch
            {
                continue; 
            }
        }

        return query;
    }
}
