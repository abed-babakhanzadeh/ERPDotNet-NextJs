using ERPDotNet.Domain.Modules.UserAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ERPDotNet.Infrastructure.Modules.UserAccess.Persistence.Configurations;

public class RolePermissionConfiguration : IEntityTypeConfiguration<RolePermission>
{
    public void Configure(EntityTypeBuilder<RolePermission> builder)
    {
        builder.ToTable("role_permissions", "security");
        
        // کلید ترکیبی (RoleId + PermissionId)
        builder.HasKey(rp => new { rp.RoleId, rp.PermissionId });
    }
}