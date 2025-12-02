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

        // Map DTO property names to entity property names for filters
        if (request.Filters != null && request.Filters.Any())
        {
            foreach (var filter in request.Filters)
            {
                filter.PropertyName = filter.PropertyName switch
                {
                    "productCode" => "Product.Code",
                    "productName" => "Product.Name",
                    "title" => "Title",
                    "version" => "Version",
                    "type" => "Type",
                    "status" => "Status",
                    "isActive" => "IsActive",
                    _ => filter.PropertyName
                };
            }
        }

        query = query.ApplyDynamicFilters(request.Filters);

        // Map DTO property names to entity property names for sorting
        string? mappedSortColumn = request.SortColumn switch
        {
            "productCode" => "Product.Code",
            "productName" => "Product.Name",
            "title" => "Title",
            "version" => "Version",
            "type" => "Type",
            "status" => "Status",
            "isActive" => "IsActive",
            _ => request.SortColumn
        };

        // --- سورت هوشمند ---
        if (!string.IsNullOrEmpty(mappedSortColumn))
        {
            // اکستنشن ما "Product.Code" را می‌فهمد و چون string است، نچرال سورت می‌کند
            query = query.OrderByNatural(mappedSortColumn, request.SortDescending);
        }
        else
        {
            query = query.OrderByDescending(x => x.Id);
        }
        // -------------------

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