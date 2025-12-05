using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Modules.BaseInfo.Entities;
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
    string? ImagePath,
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
            .Include(p => p.Unit) // حتما باید اینکلود باشد تا Unit.Title کار کند
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

        // جستجوی case-insensitive
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchLower = request.SearchTerm.ToLower();
            query = query.Where(p =>
                (p.Name != null && p.Name.ToLower().Contains(searchLower)) ||
                (p.Code != null && p.Code.ToLower().Contains(searchLower)));
        }

        // 4. سورت (بخش اصلاح شده)
     var sortColumn = request.SortColumn;

    if (!string.IsNullOrEmpty(sortColumn))
    {
        // مپینگ نام‌های DTO به نام‌های واقعی در Entity
        if (sortColumn.Equals("UnitName", StringComparison.OrdinalIgnoreCase))
        {
            sortColumn = "Unit.Title";
        }
        else if (sortColumn.Equals("SupplyTypeId", StringComparison.OrdinalIgnoreCase) 
              || sortColumn.Equals("SupplyType", StringComparison.OrdinalIgnoreCase))
        {
            // در DTO ممکن است SupplyTypeId یا SupplyType باشد، اما در Entity فقط SupplyType (Enum) داریم
            sortColumn = "SupplyType";
        }
        
        // نکته مهم درباره "ستون فرعی" (Alternative Unit)
        // اگر منظور شما از ستون فرعی، نام واحد جایگزین است، چون این یک لیست است (1 به چند)،
        // سورت کردن روی آن پیچیده است. اما اگر بخواهید بر اساس "اولین واحد فرعی" سورت کنید:
        if (sortColumn.Equals("Conversions", StringComparison.OrdinalIgnoreCase) || 
            sortColumn.Equals("AlternativeUnitName", StringComparison.OrdinalIgnoreCase))
        {
            // روش اصلاح شده: ابتدا Select سپس FirstOrDefault
            // این روش از خطای نال جلوگیری می‌کند و SQL بهینه‌تری تولید می‌کند
            if (request.SortDescending)
            {
                query = query.OrderByDescending(p => p.UnitConversions
                                                      .Select(c => c.AlternativeUnit!.Title)
                                                      .FirstOrDefault());
            }
            else
            {
                query = query.OrderBy(p => p.UnitConversions
                                            .Select(c => c.AlternativeUnit!.Title)
                                            .FirstOrDefault());
            }
  
        }
    else
    {
        query = query.OrderByNatural("Code", false); 
    }
    }

    // --- ادامه کد (Projection) ---
    var dtoQuery = query.Select(p => new ProductDto(
        p.Id,
        p.Code,
        p.Name,
        p.UnitId,
        p.Unit != null ? p.Unit.Title : "",
        (int)p.SupplyType,
        p.SupplyType.ToDisplay(),
        p.ImagePath,
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