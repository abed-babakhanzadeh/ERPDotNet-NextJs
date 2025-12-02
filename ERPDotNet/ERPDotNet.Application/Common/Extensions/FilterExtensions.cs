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

        // 1. گروه‌بندی فیلترها بر اساس نام ستون
        // دلیل: معمولا وقتی روی یک ستون چند شرط میگذاریم، میخواهیم بین آنها OR یا AND باشد.
        // اما بین ستون‌های مختلف (مثلا نام کالا و کد کالا) همیشه AND برقرار است.
        var groupedFilters = filters.GroupBy(f => f.PropertyName);

        foreach (var group in groupedFilters)
        {
            var propertyName = group.Key;
            
            // دریافت منطق (AND/OR) از اولین آیتم گروه (چون در UI برای کل ستون یک منطق انتخاب میشود)
            var logic = group.First().Logic?.ToLower() ?? "and";

            // پارامتر اکسپرشن (مثلا: x => ...)
            // نکته حیاتی: باید یک پارامتر برای کل گروه استفاده شود تا بتوانیم ترکیب کنیم
            var parameter = Expression.Parameter(typeof(T), "x");
            
            Expression? combinedExpression = null;

            foreach (var filter in group)
            {
                if (string.IsNullOrEmpty(filter.Value)) continue;

                try
                {
                    // --- ساخت اکسپرشن برای دسترسی به پراپرتی (مثل کد قبلی شما) ---
                    Expression propertyAccess;
                    if (propertyName.Contains("."))
                    {
                        var parts = propertyName.Split('.');
                        propertyAccess = Expression.PropertyOrField(parameter, parts[0]);
                        foreach (var part in parts.Skip(1))
                        {
                            propertyAccess = Expression.PropertyOrField(propertyAccess, part);
                        }
                    }
                    else
                    {
                        propertyAccess = Expression.Property(parameter, propertyName);
                    }

                    // تبدیل مقدار ورودی به تایپ پراپرتی
                    var targetType = Nullable.GetUnderlyingType(propertyAccess.Type) ?? propertyAccess.Type;
                    object convertedValue;

                    if (targetType == typeof(bool))
                    {
                        if (bool.TryParse(filter.Value, out bool boolValue)) convertedValue = boolValue;
                        else continue;
                    }
                    else if (targetType.IsEnum)
                    {
                         // هندل کردن Enum اگر نیاز شد
                         try { convertedValue = Enum.Parse(targetType, filter.Value); }
                         catch { continue; }
                    }
                    else
                    {
                        convertedValue = Convert.ChangeType(filter.Value, targetType);
                    }

                    var constant = Expression.Constant(convertedValue, propertyAccess.Type); // استفاده از propertyAccess.Type برای هندل کردن Nullable
                    Expression comparison;

                    // --- ساخت مقایسه (مثل کد قبلی) ---
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
                            if (propertyAccess.Type == typeof(string) || propertyAccess.Type == typeof(string)) // هندل کردن نال‌پذیر
                            {
                                // هندل کردن Null Check برای Contains
                                // x.Name != null && x.Name.Contains(...)
                                var notNull = Expression.NotEqual(propertyAccess, Expression.Constant(null));
                                
                                var stringConstant = Expression.Constant(filter.Value, typeof(string));
                                var method = typeof(string).GetMethod("Contains", new[] { typeof(string) });
                                
                                var containsMethod = Expression.Call(propertyAccess, method!, stringConstant);
                                
                                comparison = Expression.AndAlso(notNull, containsMethod);
                            }
                            else
                            {
                                comparison = Expression.Equal(propertyAccess, constant);
                            }
                            break;
                        case "startswith": // اضافه کردن StartsWith چون کاربردی است
                             if (propertyAccess.Type == typeof(string))
                            {
                                var notNull = Expression.NotEqual(propertyAccess, Expression.Constant(null));
                                var method = typeof(string).GetMethod("StartsWith", new[] { typeof(string) });
                                var methodCall = Expression.Call(propertyAccess, method!, Expression.Constant(filter.Value, typeof(string)));
                                comparison = Expression.AndAlso(notNull, methodCall);
                            }
                            else comparison = Expression.Equal(propertyAccess, constant);
                            break;
                        default:
                            continue;
                    }

                    // --- ترکیب شرط‌ها (بخش جدید) ---
                    if (combinedExpression == null)
                    {
                        combinedExpression = comparison;
                    }
                    else
                    {
                        if (logic == "or")
                        {
                            combinedExpression = Expression.OrElse(combinedExpression, comparison);
                        }
                        else
                        {
                            combinedExpression = Expression.AndAlso(combinedExpression, comparison);
                        }
                    }
                }
                catch
                {
                    continue;
                }
            }

            // اگر اکسپرشنی ساخته شد، آن را به کوئری اعمال کن
            if (combinedExpression != null)
            {
                var lambda = Expression.Lambda<Func<T, bool>>(combinedExpression, parameter);
                query = query.Where(lambda);
            }
        }

        return query;
    }
}