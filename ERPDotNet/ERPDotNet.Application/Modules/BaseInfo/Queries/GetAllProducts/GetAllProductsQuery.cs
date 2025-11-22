using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Modules.BaseInfo.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using ERPDotNet.Application.Common.Extensions;
using ERPDotNet.Application.Common.Models;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllProducts;

// DTO خروجی
public record ProductDto(
    int Id, 
    string Code, 
    string Name, 
    string UnitName,      // نام واحد اصلی
    string SupplyType,    // عنوان فارسی نوع تامین
    List<ProductConversionDto> Conversions   // تعداد واحدهای فرعی (برای اطلاع)
);

// 1. ارث‌بری از PaginatedRequest و فعال‌سازی کش
[Cached(timeToLiveSeconds: 600, "Products")]
public record GetAllProductsQuery : PaginatedRequest, IRequest<PaginatedResult<ProductDto>>;
public record ProductConversionDto(string AlternativeUnitName, decimal Factor);

public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllProductsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        // 1. کوئری پایه
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Unit)
            .Include(p => p.UnitConversions)
            .ThenInclude(c => c.AlternativeUnit)
            .AsQueryable();

        // 2. اعمال فیلتر متنی ساده (SearchBox)
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(p => 
                p.Name.Contains(request.SearchTerm) || 
                p.Code.Contains(request.SearchTerm));
        }

        // 3. اعمال فیلترهای پیشرفته (JSON Filters)
        query = query.ApplyDynamicFilters(request.Filters);

        // 4. اعمال سورت داینامیک
        if (!string.IsNullOrEmpty(request.SortColumn))
        {
            query = query.OrderByDynamic(request.SortColumn, request.SortDescending);
        }
        else
        {
            query = query.OrderBy(p => p.Code); // سورت پیش‌فرض
        }

        // 5. پروجکشن به DTO
        var dtoQuery = query.Select(p => new ProductDto(
            p.Id,
            p.Code,
            p.Name,
            p.Unit.Title,
            p.SupplyType == ProductSupplyType.Purchased ? "خریدنی" : 
            p.SupplyType == ProductSupplyType.Manufactured ? "تولیدی" : "خدمات",
            // مپ کردن لیست تبدیل‌ها
            p.UnitConversions.Select(c => new ProductConversionDto(
                c.AlternativeUnit.Title, 
                c.Factor
            )).ToList()
        ));

        // 6. خروجی صفحه‌بندی شده
        return await dtoQuery.ToPaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
    }
}