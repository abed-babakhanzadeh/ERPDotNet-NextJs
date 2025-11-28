using ERPDotNet.Domain.Modules.BaseInfo.Entities;
using ERPDotNet.Domain.Modules.ProductEngineering.Entities; // <--- این را اضافه کنید
using ERPDotNet.Domain.Modules.UserAccess.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure; // برای DatabaseFacade

namespace ERPDotNet.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    // جداول UserAccess
    DbSet<User> Users { get; }
    DbSet<Permission> Permissions { get; }
    DbSet<RolePermission> RolePermissions { get; }
    DbSet<UserPermission> UserPermissions { get; }

    // جداول BaseInfo
    DbSet<Unit> Units { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductUnitConversion> ProductUnitConversions { get; }

    // جداول ProductEngineering (BOM) ---> این‌ها را اضافه کنید
    DbSet<BOMHeader> BOMHeaders { get; }
    DbSet<BOMDetail> BOMDetails { get; }
    DbSet<BOMSubstitute> BOMSubstitutes { get; }

    // متدهای پایه
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    DatabaseFacade Database { get; }
}