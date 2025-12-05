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
            .Include(u => u.BaseUnit) // برای دسترسی به BaseUnit.Title ضروری است
            .AsQueryable();

        // 1. اعمال جستجوی کلی
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(u => u.Title.Contains(request.SearchTerm) || u.Symbol.Contains(request.SearchTerm));
        }
        
        // 2. هندل کردن فیلتر خاص BaseUnitName (همچنان لازم است چون نام پراپرتی متفاوت است)
        var baseUnitNameFilter = request.Filters?.FirstOrDefault(f => f.PropertyName.Equals("BaseUnitName", StringComparison.OrdinalIgnoreCase));
        if (baseUnitNameFilter != null && !string.IsNullOrEmpty(baseUnitNameFilter.Value))
        {
            query = query.Where(u => u.BaseUnit != null && u.BaseUnit.Title.Contains(baseUnitNameFilter.Value));
            request.Filters?.Remove(baseUnitNameFilter);
        }

        // 3. اعمال بقیه فیلترهای داینامیک
        query = query.ApplyDynamicFilters(request.Filters);

        // 4. مرتب‌سازی (بخش اصلاح شده)
        var sortColumn = request.SortColumn;

        // مپ کردن نام ستون DTO به مسیر Entity
        // چون OrderByNatural روی Entity کار می‌کند، باید نام دقیق مسیر را بداند
        if (string.Equals(sortColumn, "BaseUnitName", StringComparison.OrdinalIgnoreCase))
        {
            sortColumn = "BaseUnit.Title";
        }

        if (!string.IsNullOrEmpty(sortColumn))
        {
            // حالا OrderByNatural خودش تشخیص می‌دهد که این مسیر Nullable است و نال‌ها را به انتها می‌فرستد
            query = query.OrderByNatural(sortColumn, request.SortDescending);
        }
        else
        {
            // سورت پیش‌فرض
            query = query.OrderByNatural("Id", false);
        }

        // 5. پروجکشن به DTO
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

        // 6. خروجی صفحه‌بندی شده
        return await dtoQuery.ToPaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
    }
}