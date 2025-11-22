using ERPDotNet.Domain.Modules.BaseInfo.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    // جدول واحدها
    DbSet<Unit> Units { get; }

    // === این دو خط فراموش شده بود ===
    DbSet<Product> Products { get; }
    DbSet<ProductUnitConversion> ProductUnitConversions { get; }
    // ===============================

    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}