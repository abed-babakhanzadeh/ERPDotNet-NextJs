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

        // 4. سورت اصلاح شده (یکپارچه با اکستنشن متد)
        var sortColumn = request.SortColumn;

        // حالت خاص: سورت روی لیست‌های تو در تو (که اکستنشن متد از آن پشتیبانی نمی‌کند)
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
            // حالت استاندارد: استفاده از اکستنشن متد OrderByNatural
            
            // الف) مپینگ نام‌های DTO به مسیر Entity
            if (string.Equals(sortColumn, "UnitName", StringComparison.OrdinalIgnoreCase))
            {
                sortColumn = "Unit.Title";
            }
            else if (string.Equals(sortColumn, "SupplyTypeId", StringComparison.OrdinalIgnoreCase) 
                  || string.Equals(sortColumn, "SupplyType", StringComparison.OrdinalIgnoreCase))
            {
                sortColumn = "SupplyType";
            }

            // ب) اعمال سورت پیش‌فرض یا درخواستی
            if (!string.IsNullOrEmpty(sortColumn))
            {
                // این متد خودش نزولی/صعودی، نال‌ها و سورت طبیعی (Collate) را هندل می‌کند
                query = query.OrderByNatural(sortColumn, request.SortDescending);
            }
            else
            {
                // سورت پیش‌فرض روی کد
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