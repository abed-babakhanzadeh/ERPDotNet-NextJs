using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Extensions;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Common.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.ProductEngineering.Queries.GetWhereUsed;

[Cached(timeToLiveSeconds: 60, "WhereUsed")]
public record GetWhereUsedQuery : PaginatedRequest, IRequest<PaginatedResult<WhereUsedDto>>
{
    public int ProductId { get; set; }
    public bool MultiLevel { get; set; } = false;
    public bool EndItemsOnly { get; set; } = false;
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
        List<WhereUsedDto> finalDtos = new();
        int totalCount = 0;

        if (request.MultiLevel)
        {
            // 1. فراخوانی تابع بازگشتی (کل درخت از پایین به بالا)
            var rawData = await _context.Set<WhereUsedRecursiveResult>()
                .FromSqlInterpolated($"SELECT * FROM get_where_used_recursive({request.ProductId})")
                .ToListAsync(cancellationToken);

            // 2. اعمال فیلتر "فقط محصولات نهایی"
            if (request.EndItemsOnly)
            {
                // الگوریتم: محصولاتی که در این لیست هستند (Parent)، آیا خودشان جایی Child هستند؟
                // اگر Child باشند، یعنی محصول نهایی نیستند (هنوز پدر دارند).
                
                // الف) تمام ProductId های موجود در لیست (همه پدران و اجداد)
                var allParentIds = rawData.Select(x => x.ProductId).Distinct().ToList();

                // ب) چک می‌کنیم کدام یک از اینها در جدول BOMDetails به عنوان Child استفاده شده‌اند
                // (فقط در BOMهای فعال)
                var notEndItems = await _context.BOMDetails
                    .AsNoTracking()
                    .Include(d => d.BOMHeader)
                    .Where(d => allParentIds.Contains(d.ChildProductId) && d.BOMHeader!.IsActive)
                    .Select(d => d.ChildProductId)
                    .Distinct()
                    .ToListAsync(cancellationToken);

                // ج) محصولات نهایی = کل لیست - آنهایی که فرزند هستند
                // نکته: ما ردیف‌های گزارش را فیلتر می‌کنیم
                rawData = rawData
                    .Where(r => !notEndItems.Contains(r.ProductId))
                    .ToList();
            }

            // 3. دریافت اطلاعات تکمیلی (نام، کد، ورژن)
            var bomIds = rawData.Select(r => r.BomHeaderId).Distinct().ToList();
            
            var bomDetails = await _context.BOMHeaders
                .AsNoTracking()
                .Include(b => b.Product).ThenInclude(p => p!.Unit)
                .Where(b => bomIds.Contains(b.Id))
                .ToDictionaryAsync(b => b.Id, cancellationToken);

            // 4. مپ کردن نهایی
            finalDtos = rawData.Select(r => {
                var bom = bomDetails.GetValueOrDefault(r.BomHeaderId);
                var bomTitle = bom?.Title ?? "-";
                var bomVersion = bom?.Version ?? "-";
                var bomStatus = bom?.Status.ToDisplay() ?? "-";
                var parentName = bom?.Product?.Name ?? "-";
                var parentCode = bom?.Product?.Code ?? "-";
                var unitName = bom?.Product?.Unit?.Title ?? "-";

                return new WhereUsedDto(
                    r.BomHeaderId,
                    r.BomHeaderId,
                    bomTitle,
                    bomVersion,
                    bomStatus,
                    r.ProductId,
                    parentName,
                    parentCode,
                    r.Level == 1 ? r.UsageType : $"{r.UsageType} (سطح {r.Level})",
                    r.Quantity,
                    unitName
                );
            }).ToList();

            totalCount = finalDtos.Count;
            
            // صفحه‌بندی در حافظه
            finalDtos = finalDtos
                .Skip((request.PageNumber - 1) * request.PageSize)
                .Take(request.PageSize)
                .ToList();
        }
        else
        {
            // === حالت تک سطحی (بدون تغییر) ===
            // برای اطمینان از عملکرد، همان کد قبلی که کار می‌کرد را اینجا بگذارید
            // یا از همین روش SQL Function با فیلتر Level=1 استفاده کنید:
            
             var rawData = await _context.Set<WhereUsedRecursiveResult>()
                .FromSqlInterpolated($"SELECT * FROM get_where_used_recursive({request.ProductId})")
                .ToListAsync(cancellationToken);
                
            rawData = rawData.Where(x => x.Level == 1).ToList();
            
            var bomIds = rawData.Select(r => r.BomHeaderId).Distinct().ToList();
            var bomDetails = await _context.BOMHeaders
                .AsNoTracking()
                .Include(b => b.Product).ThenInclude(p => p!.Unit)
                .Where(b => bomIds.Contains(b.Id))
                .ToDictionaryAsync(b => b.Id, cancellationToken);

             finalDtos = rawData.Select(r => {
                var bom = bomDetails.GetValueOrDefault(r.BomHeaderId);
                // ... (مپینگ مشابه بالا) ...
                return new WhereUsedDto(
                    r.BomHeaderId, r.BomHeaderId, 
                    bom?.Title ?? "-", bom?.Version ?? "-", bom?.Status.ToDisplay() ?? "-",
                    r.ProductId, bom?.Product?.Name ?? "-", bom?.Product?.Code ?? "-",
                    r.UsageType, r.Quantity, bom?.Product?.Unit?.Title ?? "-"
                );
            }).ToList();
            
            totalCount = finalDtos.Count;
        }

        return new PaginatedResult<WhereUsedDto>(finalDtos, totalCount, request.PageNumber, request.PageSize);
    }
}