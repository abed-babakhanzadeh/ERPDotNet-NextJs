using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Models;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Common.Extensions; // برای ToPaginatedListAsync
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllUnits;

public record UnitDto(
    int Id, 
    string Title, 
    string Symbol, 
    int Precision,        // جدید
    bool IsActive,        // جدید
    int? BaseUnitId,      // جدید
    decimal ConversionFactor, 
    string? BaseUnitName
);

// [Cached(timeToLiveSeconds: 600, "Units")] 
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

        // اعمال جستجوی کلی
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(u => u.Title.Contains(request.SearchTerm) || u.Symbol.Contains(request.SearchTerm));
        }
        
        // هندل کردن فیلتر خاص BaseUnitName
        var baseUnitNameFilter = request.Filters?.FirstOrDefault(f => f.PropertyName.Equals("BaseUnitName", StringComparison.OrdinalIgnoreCase));
        if (baseUnitNameFilter != null && !string.IsNullOrEmpty(baseUnitNameFilter.Value))
        {
            query = query.Where(u => u.BaseUnit != null && u.BaseUnit.Title.Contains(baseUnitNameFilter.Value));
            // حذف فیلتر از لیست تا دوباره پردازش نشود
            request.Filters?.Remove(baseUnitNameFilter);
        }

        // اعمال بقیه فیلترهای داینامیک
        query = query.ApplyDynamicFilters(request.Filters);

        // مرتب‌سازی
        if (!string.IsNullOrEmpty(request.SortColumn))
        {
            query = query.OrderByDynamic(request.SortColumn, request.SortDescending);
        }
        else
        {
            query = query.OrderBy(u => u.Id);
        }

        // پروجکشن به DTO
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

        // خروجی صفحه‌بندی شده
        return await dtoQuery.ToPaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
    }
}
