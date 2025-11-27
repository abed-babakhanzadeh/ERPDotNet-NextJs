using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Modules.BaseInfo.Entities; // برای دسترسی به Enum
using MediatR;
using Microsoft.EntityFrameworkCore;
using ERPDotNet.Application.Common.Extensions;
using ERPDotNet.Application.Common.Models;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllProducts;

// DTO خروجی
public record ProductDto(
    int Id, 
    string Code, 
    string Name, 
    
    // --- تغییرات برای واحد سنجش ---
    int UnitId,           // <--- جدید: برای ست کردن دراپ‌داون در ویرایش
    string UnitName,      // نام واحد (برای نمایش در گرید)

    // --- تغییرات برای نوع تامین ---
    int SupplyTypeId,     // <--- جدید: عدد Enum (1, 2, 3) برای فرم ویرایش
    string SupplyType,    // عنوان فارسی (برای نمایش در گرید)
    
    List<ProductConversionDto> Conversions
);

[Cached(timeToLiveSeconds: 600, "Products")]
public record GetAllProductsQuery : PaginatedRequest, IRequest<PaginatedResult<ProductDto>>;

public record ProductConversionDto(
    int Id,               
    int AlternativeUnitId, 
    string AlternativeUnitName, 
    decimal Factor
);

public class GetAllProductsHandler : IRequestHandler<GetAllProductsQuery, PaginatedResult<ProductDto>>
{
    private readonly IApplicationDbContext _context;

    public GetAllProductsHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedResult<ProductDto>> Handle(GetAllProductsQuery request, CancellationToken cancellationToken)
    {
        // 1. کوئری پایه
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Unit)
            .Include(p => p.UnitConversions)
            .ThenInclude(c => c.AlternativeUnit)
            .AsQueryable();

        // 2. فیلتر جستجو
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            query = query.Where(p => 
                p.Name.Contains(request.SearchTerm) || 
                p.Code.Contains(request.SearchTerm));
        }

        // 3. فیلترهای داینامیک
        query = query.ApplyDynamicFilters(request.Filters);

        // 4. سورت
        if (!string.IsNullOrEmpty(request.SortColumn))
        {
            query = query.OrderByDynamic(request.SortColumn, request.SortDescending);
        }
        else
        {
            query = query.OrderBy(p => p.Code);
        }


        // 3. پروجکشن اولیه (Fetch Data)
        // نکته: اینجا هنوز تبدیل فارسی را انجام نمی‌دهیم! فقط Enum را می‌گیریم.
        // ما اینجا یک DTO موقت یا همان Entity را انتخاب می‌کنیم.
        // اما برای اینکه تمیز باشد، بیایید مستقیماً روی کوئری Paging بزنیم
        
        // تغییر استراتژی: اول IDهای صفحه مورد نظر را پیدا می‌کنیم (سبک‌ترین کوئری ممکن)
        var count = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken); // <--- اینجا دیتا از دیتابیس آمد توی رم (Memory)

        // 4. مپ کردن نهایی (In-Memory Mapping)
        // حالا که دیتا توی رم هست، می‌تونیم از متد C# (ToDisplay) استفاده کنیم
        var dtos = items.Select(p => new ProductDto(
            p.Id,
            p.Code,
            p.Name,
            p.UnitId,
            p.Unit!.Title,
            (int)p.SupplyType,
            
            p.SupplyType.ToDisplay(), // <--- استفاده از اکستنشن متد (استاندارد و تمیز!)
            
            p.UnitConversions.Select(c => new ProductConversionDto(
                c.Id,
                c.AlternativeUnitId,
                c.AlternativeUnit!.Title, 
                c.Factor
            )).ToList()
        )).ToList();


        // 5. ساخت خروجی
        return new PaginatedResult<ProductDto>(dtos, count, request.PageNumber, request.PageSize);
    }
}