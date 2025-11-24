using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Modules.BaseInfo.Entities; // برای دسترسی به Enum
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
    
    // --- تغییرات برای واحد سنجش ---
    int UnitId,           // <--- جدید: برای ست کردن دراپ‌داون در ویرایش
    string UnitName,      // نام واحد (برای نمایش در گرید)

    // --- تغییرات برای نوع تامین ---
    int SupplyTypeId,     // <--- جدید: عدد Enum (1, 2, 3) برای فرم ویرایش
    string SupplyType,    // عنوان فارسی (برای نمایش در گرید)
    
    List<ProductConversionDto> Conversions
);

[Cached(timeToLiveSeconds: 600, "Products")]
public record GetAllProductsQuery : PaginatedRequest, IRequest<PaginatedResult<ProductDto>>;

public record ProductConversionDto(
    int Id,               
    int AlternativeUnitId, 
    string AlternativeUnitName, 
    decimal Factor
);

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

        // 2. فیلتر جستجو
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(p => 
                p.Name.Contains(request.SearchTerm) || 
                p.Code.Contains(request.SearchTerm));
        }

        // 3. فیلترهای داینامیک
        query = query.ApplyDynamicFilters(request.Filters);

        // 4. سورت
        if (!string.IsNullOrEmpty(request.SortColumn))
        {
            query = query.OrderByDynamic(request.SortColumn, request.SortDescending);
        }
        else
        {
            query = query.OrderBy(p => p.Code);
        }

        // 5. پروجکشن (اصلاح شده)
        var dtoQuery = query.Select(p => new ProductDto(
            p.Id,
            p.Code,
            p.Name,
            
            p.UnitId,     // <--- مقدار عددی ID واحد
            p.Unit.Title, // مقدار متنی عنوان واحد
            
            (int)p.SupplyType, // <--- کست کردن Enum به int
            p.SupplyType == ProductSupplyType.Purchased ? "خریدنی" : 
            p.SupplyType == ProductSupplyType.Manufactured ? "تولیدی" : "خدمات",
            
            p.UnitConversions.Select(c => new ProductConversionDto(
                c.Id,
                c.AlternativeUnitId,
                c.AlternativeUnit.Title, 
                c.Factor
            )).ToList()
        ));

        // 6. خروجی
        return await dtoQuery.ToPaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
    }
}