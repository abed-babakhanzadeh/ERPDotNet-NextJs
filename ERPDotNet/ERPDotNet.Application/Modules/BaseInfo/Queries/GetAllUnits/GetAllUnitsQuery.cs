using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllUnits;

// 1. تغییر نام Factor به ConversionFactor
public record UnitDto(int Id, string Title, string Symbol, decimal ConversionFactor, string? BaseUnitName);

[Cached(timeToLiveSeconds: 600, "Units")]
public record GetAllUnitsQuery : IRequest<List<UnitDto>>;

public class GetAllUnitsHandler : IRequestHandler<GetAllUnitsQuery, List<UnitDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllUnitsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<UnitDto>> Handle(GetAllUnitsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Units
            .AsNoTracking()
            .Include(u => u.BaseUnit)
            .OrderBy(x => x.Id)
            .Select(x => new UnitDto(
                x.Id, 
                x.Title, 
                x.Symbol, 
                x.ConversionFactor, // <--- اینجا هم باید مپ شود (قبلاً x.ConversionFactor بود ولی به Factor مپ می‌شد)
                x.BaseUnit != null ? x.BaseUnit.Title : null
            ))
            .ToListAsync(cancellationToken);
    }
}