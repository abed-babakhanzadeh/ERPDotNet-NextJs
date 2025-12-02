using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllUnits; // برای دسترسی به UnitDto
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetUnitById;

// تعریف درخواست
public record GetUnitByIdQuery(int Id) : IRequest<UnitDto?>;

// تعریف هندلر
public class GetUnitByIdHandler : IRequestHandler<GetUnitByIdQuery, UnitDto?>
{
    private readonly IApplicationDbContext _context;

    public GetUnitByIdHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UnitDto?> Handle(GetUnitByIdQuery request, CancellationToken cancellationToken)
    {
        // استفاده از Select برای پروجکشن مستقیم (مشابه GetAll)
        var dto = await _context.Units
            .AsNoTracking()
            .Where(x => x.Id == request.Id)
            .Select(x => new UnitDto(
                x.Id,
                x.Title,
                x.Symbol,
                x.Precision,
                x.IsActive,
                x.BaseUnitId,
                x.ConversionFactor,
                x.BaseUnit != null ? x.BaseUnit.Title : null
            ))
            .FirstOrDefaultAsync(cancellationToken);

        return dto;
    }
}