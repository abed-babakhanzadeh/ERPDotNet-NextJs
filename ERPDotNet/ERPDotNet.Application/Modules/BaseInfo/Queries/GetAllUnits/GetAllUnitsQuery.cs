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

// 1. فعال‌سازی کش (Uncomment)
// چون ما ورودی (Request) را سریالایز می‌کنیم و جزو کلید کش می‌کنیم،
// اگر کاربر فیلتر متفاوتی بفرستد، کلید کش جدیدی ساخته می‌شود. عالی است!
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

        // 2. اعمال فیلترهای ساده و پیشرفته
        // (این متد ApplyDynamicFilters را قبلاً نوشتیم)
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(u => u.Title.Contains(request.SearchTerm) || u.Symbol.Contains(request.SearchTerm));
        }
        
        // اعمال فیلترهای پیشرفته (JSON)
        query = query.ApplyDynamicFilters(request.Filters);

        // 3. سورت
        if (!string.IsNullOrEmpty(request.SortColumn))
        {
            query = query.OrderByDynamic(request.SortColumn, request.SortDescending);
        }
        else
        {
            query = query.OrderBy(u => u.Id);
        }

        // 4. پروجکشن
        var dtoQuery = query.Select(x => new UnitDto(
            x.Id, 
            x.Title, 
            x.Symbol, 
            x.Precision,          // اضافه شد
            x.IsActive,           // اضافه شد
            x.BaseUnitId,         // اضافه شد
            x.ConversionFactor, 
            x.BaseUnit != null ? x.BaseUnit.Title : null
        ));

        // 5. خروجی صفحه‌بندی شده
        return await dtoQuery.ToPaginatedListAsync(request.PageNumber, request.PageSize, cancellationToken);
    }
}