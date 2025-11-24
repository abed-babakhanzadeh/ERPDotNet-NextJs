using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Infrastructure.Persistence;
using ERPDotNet.Infrastructure.Persistence.Interceptors;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ERPDotNet.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. ثبت اینترسپتور (برای لاگ کردن کاربر و تاریخ)
        services.AddScoped<AuditableEntitySaveChangesInterceptor>();

        // 2. تنظیم دیتابیس PostgreSQL
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var auditableInterceptor = sp.GetRequiredService<AuditableEntitySaveChangesInterceptor>();

            options.UseNpgsql(configuration.GetConnectionString("DefaultConnection"))
                   .AddInterceptors(auditableInterceptor); // اتصال اینترسپتور به دیتابیس
        });

        // 3. اتصال اینترفیس کانتکست به خود کانتکست (برای استفاده در لایه اپلیکیشن)
        services.AddScoped<IApplicationDbContext>(provider => provider.GetRequiredService<AppDbContext>());

        return services;
    }
}