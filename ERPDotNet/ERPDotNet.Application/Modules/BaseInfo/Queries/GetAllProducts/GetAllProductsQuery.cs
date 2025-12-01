using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Modules.BaseInfo.Entities; // برای دسترسی به Enum
using MediatR;
using Microsoft.EntityFrameworkCore;
using ERPDotNet.Application.Common.Extensions;
using ERPDotNet.Application.Common.Models;
using System.Linq;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllProducts;

public record ProductDto(
    int Id,
    string Code,
    string Name,
    int UnitId,
    string UnitName,
    int SupplyTypeId,
    string SupplyType,
    List<ProductConversionDto> Conversions
);

public record ProductConversionDto(
    int Id,
    int AlternativeUnitId,
    string AlternativeUnitName,
    decimal Factor
);

[Cached(timeToLiveSeconds: 600, "Products")]
public record GetAllProductsQuery : PaginatedRequest, IRequest<PaginatedResult<ProductDto>>;


public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllProductsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Unit)
            .AsQueryable();

        // --- فیلترهای خاص ---
        var unitNameFilter = request.Filters?.FirstOrDefault(f => f.PropertyName.Equals("unitName", StringComparison.OrdinalIgnoreCase));
        if (unitNameFilter != null && !string.IsNullOrEmpty(unitNameFilter.Value))
        {
            query = query.Where(p => p.Unit != null && p.Unit.Title.Contains(unitNameFilter.Value));
            request.Filters?.Remove(unitNameFilter);
        }
        
        var supplyTypeFilter = request.Filters?.FirstOrDefault(f => f.PropertyName.Equals("supplyType", StringComparison.OrdinalIgnoreCase));
        if (supplyTypeFilter != null && !string.IsNullOrEmpty(supplyTypeFilter.Value))
        {
            var matchingEnumValues = Enum.GetValues(typeof(ProductSupplyType))
                                         .Cast<ProductSupplyType>()
                                         .Where(e => e.ToDisplay().Contains(supplyTypeFilter.Value, StringComparison.OrdinalIgnoreCase))
                                         .ToList();
            if(matchingEnumValues.Any())
            {
                query = query.Where(p => matchingEnumValues.Contains(p.SupplyType));
            }
            
            request.Filters?.Remove(supplyTypeFilter);
        }
        // --- پایان فیلترهای خاص ---

        query = query.ApplyDynamicFilters(request.Filters);

        // جستجوی case-insensitive بعد از فیلترهای دیگر
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            // تبدیل مقدار جستجو به lower و استفاده از ToLower روی ستون‌ها تا
            // ترجمه به SQL به صورت LOWER(column) انجام شود و مقایسه case-insensitive شود.
            // این روش در اکثر پایگاه‌داده‌ها (با ترجمه صحیح توسط EF Core) کار می‌کند
            // و از بارگذاری کامل جدول (AsEnumerable) جلوگیری می‌کند.
            var searchLower = request.SearchTerm.ToLower();
            query = query.Where(p =>
                (p.Name != null && p.Name.ToLower().Contains(searchLower)) ||
                (p.Code != null && p.Code.ToLower().Contains(searchLower)));
        }

        if (!string.IsNullOrEmpty(request.SortColumn))
        {
            query = query.OrderByDynamic(request.SortColumn, request.SortDescending);
        }
        else
        {
            query = query.OrderBy(p => p.Code);
        }
        
        var dtoQuery = query.Select(p => new ProductDto(
            p.Id,
            p.Code,
            p.Name,
            p.UnitId,
            p.Unit != null ? p.Unit.Title : "",
            (int)p.SupplyType,
            p.SupplyType.ToDisplay(),
            p.UnitConversions.Select(c => new ProductConversionDto(
                c.Id,
                c.AlternativeUnitId,
                c.AlternativeUnit != null ? c.AlternativeUnit.Title : "",
                c.Factor
            )).ToList()
        ));

        return await dtoQuery.ToPaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
    }
}
