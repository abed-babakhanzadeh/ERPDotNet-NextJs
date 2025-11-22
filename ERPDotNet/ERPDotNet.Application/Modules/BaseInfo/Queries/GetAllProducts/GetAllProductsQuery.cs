using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Modules.BaseInfo.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllProducts;

// DTO خروجی
public record ProductDto(
    int Id, 
    string Code, 
    string Name, 
    string UnitName,      // نام واحد اصلی
    string SupplyType,    // عنوان فارسی نوع تامین
    int ConversionCount   // تعداد واحدهای فرعی (برای اطلاع)
);

[Cached(timeToLiveSeconds: 600, "Products")] // کش با تگ Products
public record GetAllProductsQuery : IRequest<List<ProductDto>>;

public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, List<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllProductsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Unit) // بارگذاری واحد اصلی
            .Include(p => p.UnitConversions) // بارگذاری تبدیل‌ها (برای شمارش)
            .OrderBy(p => p.Code)
            .Select(p => new ProductDto(
                p.Id,
                p.Code,
                p.Name,
                p.Unit.Title, // نام واحد
                p.SupplyType == ProductSupplyType.Purchased ? "خریدنی" : 
                p.SupplyType == ProductSupplyType.Manufactured ? "تولیدی" : "خدمات",
                p.UnitConversions.Count
            ))
            .ToListAsync(cancellationToken);
    }
}