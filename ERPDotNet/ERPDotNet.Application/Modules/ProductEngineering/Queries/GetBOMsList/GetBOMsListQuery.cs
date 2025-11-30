using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Common.Models;
using ERPDotNet.Application.Common.Extensions;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.ProductEngineering.Queries.GetBOMsList;

public record BOMListDto(
    int Id,
    string ProductName,
    string ProductCode,
    string Version,
    string Title,
    string Type,
    string Status,
    bool IsActive
);

[Cached(timeToLiveSeconds: 300, "BOMs")]
public record GetBOMsListQuery : PaginatedRequest, IRequest<PaginatedResult<BOMListDto>>;

public class GetBOMsListHandler : IRequestHandler<GetBOMsListQuery, PaginatedResult<BOMListDto>>
{
    private readonly IApplicationDbContext _context;

    public GetBOMsListHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<BOMListDto>> Handle(GetBOMsListQuery request, CancellationToken cancellationToken)
    {
        var query = _context.BOMHeaders
            .AsNoTracking()
            .Include(x => x.Product)
            .AsQueryable();

        // فیلتر جستجو
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(x => 
                x.Title.Contains(request.SearchTerm) || 
                x.Product!.Name.Contains(request.SearchTerm) ||
                x.Product.Code.Contains(request.SearchTerm));
        }

        query = query.ApplyDynamicFilters(request.Filters);

        if (!string.IsNullOrEmpty(request.SortColumn))
            query = query.OrderByDynamic(request.SortColumn, request.SortDescending);
        else
            query = query.OrderByDescending(x => x.Id);

        // پیجینگ دستی (استاندارد جدید)
        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // مپینگ
        var dtos = items.Select(x => new BOMListDto(
            x.Id,
            x.Product!.Name,
            x.Product.Code,
            x.Version,
            x.Title,
            x.Type.ToDisplay(),
            x.Status.ToDisplay(),
            x.IsActive
        )).ToList();

        return new PaginatedResult<BOMListDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}