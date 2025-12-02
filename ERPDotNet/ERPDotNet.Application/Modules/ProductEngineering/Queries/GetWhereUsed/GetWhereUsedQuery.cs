using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Extensions;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Common.Models;
using ERPDotNet.Domain.Modules.ProductEngineering.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.ProductEngineering.Queries.GetWhereUsed;

[Cached(timeToLiveSeconds: 60, "WhereUsed")] // کش کوتاه مدت
public record GetWhereUsedQuery : PaginatedRequest, IRequest<PaginatedResult<WhereUsedDto>>
{
    public int ProductId { get; set; } // کالایی که دنبالش می‌گردیم
}

public class GetWhereUsedHandler : IRequestHandler<GetWhereUsedQuery, PaginatedResult<WhereUsedDto>>
{
    private readonly IApplicationDbContext _context;

    public GetWhereUsedHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<WhereUsedDto>> Handle(GetWhereUsedQuery request, CancellationToken cancellationToken)
    {
        // 1. جستجو در مواد اولیه مستقیم (Direct Usage)
        var directUsageQuery = _context.BOMDetails
            .AsNoTracking()
            .Where(d => d.ChildProductId == request.ProductId)
            .Select(d => new 
            {
                d.BOMHeaderId,
                d.BOMHeader!.Title,
                d.BOMHeader.Version,
                d.BOMHeader.Status,
                d.BOMHeader.ProductId,
                d.BOMHeader.Product!.Name,
                d.BOMHeader.Product.Code,
                UnitName = d.BOMHeader.Product.Unit!.Title,
                UsageType = "ماده اولیه",
                Quantity = d.Quantity
            });

        // 2. جستجو در جایگزین‌ها (Substitute Usage)
        var subUsageQuery = _context.BOMSubstitutes
            .AsNoTracking()
            .Where(s => s.SubstituteProductId == request.ProductId)
            .Select(s => new 
            {
                BOMHeaderId = s.BOMDetail!.BOMHeaderId,
                Title = s.BOMDetail.BOMHeader!.Title,
                Version = s.BOMDetail.BOMHeader.Version,
                Status = s.BOMDetail.BOMHeader.Status,
                ProductId = s.BOMDetail.BOMHeader.ProductId,
                Name = s.BOMDetail.BOMHeader.Product!.Name,
                Code = s.BOMDetail.BOMHeader.Product.Code,
                UnitName = s.BOMDetail.BOMHeader.Product.Unit!.Title,
                UsageType = "جایگزین",
                Quantity = s.Factor // اینجا ضریب را به جای مقدار نمایش می‌دهیم
            });

        // 3. ترکیب دو کوئری (Union)
        var combinedQuery = directUsageQuery.Union(subUsageQuery);

        // 4. اعمال فیلتر جستجو (روی نام محصول پدر یا ورژن BOM)
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            combinedQuery = combinedQuery.Where(x => 
                x.Name.Contains(request.SearchTerm) || 
                x.Code.Contains(request.SearchTerm) ||
                x.Title.Contains(request.SearchTerm));
        }

        // --- سورت هوشمند (جدید) ---
        if (!string.IsNullOrEmpty(request.SortColumn))
        {
            // نکته: SortColumn باید دقیقاً هم‌نام پراپرتی‌هایно Select بالا باشد (مثلا "Code" یا "Name")
            // اگر فرانت camelCase می‌فرستد، باید در فرانت یا اینجا هندل شود (معمولا MRT دقیق می‌فرستد)
            combinedQuery = combinedQuery.OrderByNatural(request.SortColumn, request.SortDescending);
        }
        else
        {
            // پیش‌فرض: سورت نچرال روی نام محصول
            combinedQuery = combinedQuery.OrderByNatural("Name", false);
        }

        // 5. صفحه بندی دستی
        var totalCount = await combinedQuery.CountAsync(cancellationToken);
        
        var items = await combinedQuery
            .OrderBy(x => x.Name) // مرتب‌سازی بر اساس نام محصول نهایی
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        // 6. مپینگ نهایی
        var dtos = items.Select(x => new WhereUsedDto(
            x.BOMHeaderId,
            x.Title,
            x.Version,
            x.Status.ToDisplay(),
            x.ProductId,
            x.Name,
            x.Code,
            x.UsageType,
            x.Quantity,
            x.UnitName
        )).ToList();

        return new PaginatedResult<WhereUsedDto>(dtos, totalCount, request.PageNumber, request.PageSize);
    }
}