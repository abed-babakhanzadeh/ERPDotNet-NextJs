using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ERPDotNet.Domain.Modules.UserAccess.Entities;
using System.Reflection;

namespace ERPDotNet.Infrastructure.Persistence;

public class AppDbContext : IdentityDbContext<User>
{
    // جداول جدید ماژول دسترسی
    public DbSet<Permission> Permissions { get; set; }
    public DbSet<RolePermission> RolePermissions { get; set; }
    public DbSet<UserPermission> UserPermissions { get; set; }

    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        // این خط برای Identity ضروری است
        base.OnModelCreating(builder);

        // === جادوی ماژولار ===
        // این یک خط کد، تمام فایل‌های Configuration (User, Identity, Permission, ...) 
        // را که در کل پروژه نوشتیم پیدا می‌کند و اجرا می‌کند.
        builder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());
    }
}