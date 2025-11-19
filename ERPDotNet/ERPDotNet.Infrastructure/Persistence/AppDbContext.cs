using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ERPDotNet.Domain.Modules.UserAccess.Entities; 

namespace ERPDotNet.Infrastructure.Persistence;

// ارث‌بری از IdentityDbContext برای پشتیبانی از جداول یوزر و نقش
public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // تغییر نام جداول پیش‌فرض Identity (برای زیبایی و نظم دیتابیس)
        // جداول به جای نام‌های طولانی AspNetUsers می‌شوند: users, roles, ...
        
        builder.Entity<User>().ToTable("users", "security");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRole>().ToTable("roles", "security");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserRole<string>>().ToTable("user_roles", "security");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserClaim<string>>().ToTable("user_claims", "security");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserLogin<string>>().ToTable("user_logins", "security");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>>().ToTable("role_claims", "security");
        builder.Entity<Microsoft.AspNetCore.Identity.IdentityUserToken<string>>().ToTable("user_tokens", "security");

        // تنظیمات خاص برای User
        builder.Entity<User>(entity =>
        {
            entity.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
            entity.Property(e => e.LastName).HasMaxLength(50).IsRequired();
            entity.HasIndex(e => e.NationalCode).IsUnique(); // کد ملی باید یکتا باشد
        });
    }
}