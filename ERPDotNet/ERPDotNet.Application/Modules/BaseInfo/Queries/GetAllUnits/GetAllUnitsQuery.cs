using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Models;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Common.Extensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllUnits;

public record UnitDto(
    int Id, 
    string Title, 
    string Symbol, 
    int Precision,
    bool IsActive,
    int? BaseUnitId,
    decimal ConversionFactor, 
    string? BaseUnitName
);

[Cached(timeToLiveSeconds: 600, "Units")] 
public record GetAllUnitsQuery : PaginatedRequest, IRequest<PaginatedResult<UnitDto>>;

public class GetAllUnitsHandler : IRequestHandler<GetAllUnitsQuery, PaginatedResult<UnitDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllUnitsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

public async Task<PaginatedResult<UnitDto>> Handle(GetAllUnitsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Units
            .AsNoTracking()
            .Include(u => u.BaseUnit)
            .AsQueryable();

        // 1. جستجوی کلی
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(u => u.Title.Contains(request.SearchTerm) || u.Symbol.Contains(request.SearchTerm));
        }
        
        // 2. اصلاح نام فیلتر BaseUnitName (مپینگ به Entity)
        if (request.Filters != null)
        {
            var baseUnitNameFilter = request.Filters.FirstOrDefault(f => f.PropertyName.Equals("BaseUnitName", StringComparison.OrdinalIgnoreCase));
            if (baseUnitNameFilter != null)
            {
                // فقط نام پراپرتی را عوض می‌کنیم و می‌گذاریم در لیست بماند
                // تا ApplyDynamicFilters نوع عملیات (مثلاً notContains) را روی آن اعمال کند
                baseUnitNameFilter.PropertyName = "BaseUnit.Title";
            }
        }

        // 3. اعمال فیلترهای داینامیک (حالا BaseUnit.Title را می‌شناسد و عملیات را درست انجام می‌دهد)
        query = query.ApplyDynamicFilters(request.Filters);

        // 4. مرتب‌سازی
        var sortColumn = request.SortColumn;

        if (string.Equals(sortColumn, "BaseUnitName", StringComparison.OrdinalIgnoreCase))
        {
            sortColumn = "BaseUnit.Title";
        }

        if (!string.IsNullOrEmpty(sortColumn))
        {
            query = query.OrderByNatural(sortColumn, request.SortDescending);
        }
        else
        {
            query = query.OrderByNatural("Id", false);
        }

        // 5. پروجکشن
        var dtoQuery = query.Select(x => new UnitDto(
            x.Id, 
            x.Title, 
            x.Symbol, 
            x.Precision,
            x.IsActive,
            x.BaseUnitId,
            x.ConversionFactor, 
            x.BaseUnit != null ? x.BaseUnit.Title : null
        ));

        return await dtoQuery.ToPaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
    }

}