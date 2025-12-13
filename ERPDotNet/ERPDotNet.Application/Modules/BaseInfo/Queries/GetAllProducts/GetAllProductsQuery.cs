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
            .Include(p => p.Unit)
            .AsQueryable();

        // --- اصلاح نام فیلترها برای تطابق با Entity ---
        // به جای فیلتر کردن دستی، فقط نام پراپرتی را عوض می‌کنیم تا اکستنشن متد بفهمد کجاست
        if (request.Filters != null)
        {
            var unitNameFilter = request.Filters.FirstOrDefault(f => f.PropertyName.Equals("unitName", StringComparison.OrdinalIgnoreCase));
            if (unitNameFilter != null)
            {
                // مپ کردن نام فرانت (unitName) به مسیر دیتابیس (Unit.Title)
                unitNameFilter.PropertyName = "Unit.Title";
            }

            // برای SupplyType چون Enum است و نیاز به هندل کردن خاص دارد، فعلاً لاجیک دستی شما را نگه داشتم
            // اما اگر بخواهید منفی‌ها روی آن کار کند باید لاجیک پیچیده‌تری بنویسید.
            // فعلاً تمرکز روی unitName بود که "شامل نباشد" کار نمی‌کرد.
            var supplyTypeFilter = request.Filters.FirstOrDefault(f => f.PropertyName.Equals("supplyType", StringComparison.OrdinalIgnoreCase));
            if (supplyTypeFilter != null && !string.IsNullOrEmpty(supplyTypeFilter.Value))
            {
                 // اینجا چون تبدیل Enum به String داریم، هندل کردنش در اکستنشن سخت است.
                 // فعلاً همین‌طور بماند، اما بدانید که SupplyType فعلاً فقط "شامل" را ساپورت می‌کند.
                 // اگر خواستید این را هم درست کنیم بگویید.
                var matchingEnumValues = Enum.GetValues(typeof(ProductSupplyType))
                                             .Cast<ProductSupplyType>()
                                             .Where(e => e.ToDisplay().Contains(supplyTypeFilter.Value, StringComparison.OrdinalIgnoreCase))
                                             .ToList();
                if(matchingEnumValues.Any())
                {
                    query = query.Where(p => matchingEnumValues.Contains(p.SupplyType));
                }
                request.Filters.Remove(supplyTypeFilter);
            }
        }
        // --- پایان اصلاح ---

        // حالا ApplyDynamicFilters اجرا می‌شود و چون نام "Unit.Title" شده، خودش Contains یا NotContains را می‌فهمد
        query = query.ApplyDynamicFilters(request.Filters);

        // جستجوی کلی
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchLower = request.SearchTerm.ToLower();
            query = query.Where(p =>
                (p.Name != null && p.Name.ToLower().Contains(searchLower)) ||
                (p.Code != null && p.Code.ToLower().Contains(searchLower)));
        }

        // سورت
        var sortColumn = request.SortColumn;

        if (string.Equals(sortColumn, "Conversions", StringComparison.OrdinalIgnoreCase) || 
            string.Equals(sortColumn, "AlternativeUnitName", StringComparison.OrdinalIgnoreCase))
        {
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
            if (string.Equals(sortColumn, "UnitName", StringComparison.OrdinalIgnoreCase))
            {
                sortColumn = "Unit.Title";
            }
            else if (string.Equals(sortColumn, "SupplyTypeId", StringComparison.OrdinalIgnoreCase) 
                  || string.Equals(sortColumn, "SupplyType", StringComparison.OrdinalIgnoreCase))
            {
                sortColumn = "SupplyType";
            }

            if (!string.IsNullOrEmpty(sortColumn))
            {
                query = query.OrderByNatural(sortColumn, request.SortDescending);
            }
            else
            {
                query = query.OrderByNatural("Code", false);
            }
        }

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