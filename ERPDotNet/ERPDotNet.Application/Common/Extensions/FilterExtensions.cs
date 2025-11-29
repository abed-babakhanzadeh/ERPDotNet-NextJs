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
                var property = Expression.Property(parameter, filter.PropertyName);
                
                var targetType = Nullable.GetUnderlyingType(property.Type) ?? property.Type;

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

                var constant = Expression.Constant(convertedValue, property.Type);
                Expression comparison;

                switch (filter.Operation.ToLower())
                {
                    case "equals":
                    case "eq":
                        comparison = Expression.Equal(property, constant);
                        break;
                    
                    case "neq":
                        comparison = Expression.NotEqual(property, constant);
                        break;

                    case "gt":
                        comparison = Expression.GreaterThan(property, constant);
                        break;

                    case "gte":
                        comparison = Expression.GreaterThanOrEqual(property, constant);
                        break;

                    case "lt":
                        comparison = Expression.LessThan(property, constant);
                        break;

                    case "lte":
                        comparison = Expression.LessThanOrEqual(property, constant);
                        break;

                    case "contains":
                        if (property.Type == typeof(string))
                        {
                            var stringConstant = Expression.Constant(filter.Value, typeof(string));
                            var method = typeof(string).GetMethod("Contains", new[] { typeof(string) });
                            if (method != null)
                            {
                                comparison = Expression.Call(property, method, stringConstant);
                            }
                            else
                            {
                                comparison = Expression.Equal(property, constant);
                            }
                        }
                        else
                        {
                            // برای انواع دیگر، Contains معادل Equals است
                            comparison = Expression.Equal(property, constant);
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
