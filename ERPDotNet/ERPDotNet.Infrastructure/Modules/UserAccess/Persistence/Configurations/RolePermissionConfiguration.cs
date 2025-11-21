using ERPDotNet.Domain.Modules.UserAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPDotNet.Infrastructure.Modules.UserAccess.Persistence.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("role_permissions", "security");
        
        builder.HasKey(rp => new { rp.RoleId, rp.PermissionId });

        // === Seed Data: دادن تمام دسترسی‌ها به ادمین ===
        // آیدی نقش ادمین در IdentityConfiguration برابر "1" بود.
        // آیدی پرمیشن‌ها در PermissionConfiguration از 1 تا 6 بود.
        
        builder.HasData(
            new RolePermission { RoleId = "1", PermissionId = 1 }, // System
            new RolePermission { RoleId = "1", PermissionId = 2 }, // UserAccess
            new RolePermission { RoleId = "1", PermissionId = 3 }, // View
            new RolePermission { RoleId = "1", PermissionId = 4 }, // Create
            new RolePermission { RoleId = "1", PermissionId = 5 }, // Edit
            new RolePermission { RoleId = "1", PermissionId = 6 },  // Delete
            new RolePermission { RoleId = "1", PermissionId = 7 },
            new RolePermission { RoleId = "1", PermissionId = 8 },
            new RolePermission { RoleId = "1", PermissionId = 9 },
            new RolePermission { RoleId = "1", PermissionId = 90 },
            new RolePermission { RoleId = "1", PermissionId = 100 }
        );
    }
}