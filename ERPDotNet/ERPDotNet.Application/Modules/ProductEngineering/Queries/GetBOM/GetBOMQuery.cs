using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Common.Extensions; // برای ToDisplay Enum
using ERPDotNet.Domain.Modules.ProductEngineering.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Globalization;

namespace ERPDotNet.Application.Modules.ProductEngineering.Queries.GetBOM;

public record GetBOMQuery(int Id) : IRequest<BOMDto?>;

public class GetBOMHandler : IRequestHandler<GetBOMQuery, BOMDto?>
{
    private readonly IApplicationDbContext _context;

    public GetBOMHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<BOMDto?> Handle(GetBOMQuery request, CancellationToken cancellationToken)
    {
        // 1. دریافت هدر با تمام مخلفات (Include تو در تو)
        var bom = await _context.BOMHeaders
            .AsNoTracking()
            .Include(x => x.Product)
                .ThenInclude(p => p.Unit) // واحد سنجش محصول اصلی
            .Include(x => x.Details)
                .ThenInclude(d => d.ChildProduct)
                    .ThenInclude(cp => cp.Unit) // واحد سنجش مواد اولیه
            .Include(x => x.Details)
                .ThenInclude(d => d.Substitutes)
                    .ThenInclude(s => s.SubstituteProduct)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (bom == null) return null;

        // 2. تبدیل تاریخ میلادی به شمسی (اختیاری - فعلا استرینگ میلادی می‌فرستیم)
        // اگر تاریخ شمسی خواستید بگویید تا مبدل اضافه کنیم.
        
        // 3. مپ کردن به DTO
        return new BOMDto(
            bom.Id,
            bom.ProductId,
            bom.Product!.Name,
            bom.Product.Code,
            bom.Product.Unit!.Title,

            bom.Title,
            bom.Version,
            (int)bom.Status,
            bom.Status.ToDisplay(), // استفاده از اکستنشن متد که ساختیم
            (int)bom.Type,
            bom.Type.ToDisplay(),

            bom.FromDate.ToShortDateString(),
            bom.ToDate?.ToShortDateString(),
            bom.IsActive,

            bom.Details.Select(d => new BOMDetailDto(
                d.Id,
                d.ChildProductId,
                d.ChildProduct!.Name,
                d.ChildProduct.Code,
                d.ChildProduct.Unit!.Title,
                
                d.Quantity,
                d.InputQuantity,
                d.InputUnitId,
                d.InputUnitId == d.ChildProduct.UnitId ? d.ChildProduct.Unit.Title : "واحد فرعی",
                d.WastePercentage,

                d.Substitutes.Select(s => new BOMSubstituteDto(
                    s.Id,
                    s.SubstituteProductId,
                    s.SubstituteProduct!.Name,
                    s.SubstituteProduct.Code,
                    s.Priority,
                    s.Factor,
                    // --- مپینگ جدید ---
                    s.IsMixAllowed,
                    s.MaxMixPercentage,
                    s.Note
                )).OrderBy(s => s.Priority).ToList()
            )).ToList()
        );
    }
}