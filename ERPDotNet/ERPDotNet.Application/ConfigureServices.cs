using System.Reflection;
using ERPDotNet.Application.Common.Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace ERPDotNet.Application;

public static class ConfigureServices
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // 1. رجیستر کردن MediatR و پایپ‌لاین‌ها
        services.AddMediatR(cfg => {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            
            // ترتیب مهم است: اول کشینگ، بعد ولیدیشن (یا برعکس بسته به نیاز)
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CachingBehavior<,>));
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(CacheInvalidationBehavior<,>));
        });

        // 2. رجیستر کردن Validators
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        return services;
    }
}