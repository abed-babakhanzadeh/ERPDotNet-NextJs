using ERPDotNet.Domain.Modules.UserAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPDotNet.Infrastructure.Modules.UserAccess.Persistence.Configurations;

public class PermissionConfiguration : IEntityTypeConfiguration<Permission>
{
    public void Configure(EntityTypeBuilder<Permission> builder)
    {
        builder.ToTable("permissions", "security");

        // تنظیم رابطه پدر-فرزندی
        builder.HasOne(p => p.Parent)
               .WithMany(p => p.Children)
               .HasForeignKey(p => p.ParentId)
               .OnDelete(DeleteBehavior.Restrict); // نباید آبشاری پاک شود

        // === Seed Data (داده‌های اولیه درخت) ===
        // اینجا ساختار درختی پایه را می‌سازیم
        builder.HasData(
            // ریشه اصلی
            new Permission { Id = 1, Name = "System", Title = "سیستم", IsMenu = false, ParentId = null },
            
            // ماژول مدیریت کاربران (منو)
            new Permission { Id = 2, Name = "UserAccess", Title = "مدیریت کاربران", IsMenu = true, ParentId = 1, Url = "/users" },
            
            // زیرمجموعه‌های مدیریت کاربران (دکمه‌ها)
            new Permission { Id = 3, Name = "UserAccess.View", Title = "مشاهده لیست", IsMenu = false, ParentId = 2 },
            new Permission { Id = 4, Name = "UserAccess.Create", Title = "افزودن کاربر", IsMenu = false, ParentId = 2 },
            new Permission { Id = 5, Name = "UserAccess.Edit", Title = "ویرایش کاربر", IsMenu = false, ParentId = 2 },
            new Permission { Id = 6, Name = "UserAccess.Delete", Title = "حذف کاربر", IsMenu = false, ParentId = 2 }
        );
    }
}