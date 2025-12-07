using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Modules.ProductEngineering.Commands.CreateBOM; // برای استفاده از DTOهای ورودی مشترک
using ERPDotNet.Domain.Modules.ProductEngineering.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.ProductEngineering.Commands.UpdateBOM;

// باطل کردن کش لیست و آیتم تکی
[CacheInvalidation("BOMs")] 
public record UpdateBOMCommand : IRequest<bool>
{
    public int Id { get; set; } // آی‌دی فرمول (از URL می‌آید)
    public required string Title { get; set; }
    public string Version { get; set; } = "1.0";
    public BOMType Type { get; set; }
    
    public DateTime FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    
    // لیست اقلام جدید (کاملاً جایگزین قبلی‌ها می‌شود)
    public List<BOMDetailInputDto> Details { get; set; } = new();
}

public class UpdateBOMValidator : AbstractValidator<UpdateBOMCommand>
{
    public UpdateBOMValidator()
    {
        RuleFor(v => v.Id).GreaterThan(0);
        RuleFor(v => v.Title).NotEmpty().MaximumLength(100);
        RuleFor(v => v.Version).NotEmpty();
        RuleFor(v => v.Details).NotEmpty().WithMessage("فرمول باید حداقل یک قلم داشته باشد.");
        
        // ولیدیشن تاریخ
        RuleFor(v => v.ToDate)
            .GreaterThan(v => v.FromDate)
            .When(v => v.ToDate.HasValue)
            .WithMessage("تاریخ پایان باید بعد از تاریخ شروع باشد.");
    }
}

public class UpdateBOMHandler : IRequestHandler<UpdateBOMCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateBOMHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateBOMCommand request, CancellationToken cancellationToken)
    {
        // 1. دریافت BOM فعلی با تمام جزییات (برای حذف صحیح)
        var bom = await _context.BOMHeaders
            .Include(x => x.Details)
                .ThenInclude(d => d.Substitutes)
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (bom == null) return false; // یا throw NotFoundException

        // 2. آپدیت فیلدهای هدر
        bom.Title = request.Title;
        bom.Version = request.Version;
        bom.Type = request.Type;
        
        // اصلاح تاریخ UTC (حیاتی برای PostgreSQL)
        bom.FromDate = request.FromDate.Kind == DateTimeKind.Utc 
            ? request.FromDate 
            : DateTime.SpecifyKind(request.FromDate, DateTimeKind.Utc);

        if (request.ToDate.HasValue)
        {
            bom.ToDate = request.ToDate.Value.Kind == DateTimeKind.Utc 
                ? request.ToDate.Value 
                : DateTime.SpecifyKind(request.ToDate.Value, DateTimeKind.Utc);
        }
        else
        {
            bom.ToDate = null;
        }

        // 3. استراتژی جایگزینی دیتیل‌ها (Replace)
        // حذف تمام دیتیل‌های قبلی
        _context.BOMDetails.RemoveRange(bom.Details);
        
        // ساخت لیست جدید
        foreach (var detailInput in request.Details)
        {
            var newDetail = new BOMDetail
            {
                BOMHeaderId = bom.Id, // اتصال به هدر فعلی
                ChildProductId = detailInput.ChildProductId,
                
                // مقادیر اصلی
                Quantity = detailInput.Quantity,
                WastePercentage = detailInput.WastePercentage,

                // مقادیر ورودی کاربر (واحد فرعی)
                InputQuantity = detailInput.InputQuantity,
                InputUnitId = detailInput.InputUnitId == 0 ? 
                    // اگر فرانت 0 فرستاد (باگ احتمالی)، سعی کن از دیتابیس کالا بگیری یا فعلا 0 بگذار
                    // اینجا بهتر است 0 بماند و در دیتابیس نال‌پذیر باشد یا فرانت اصلاح شود.
                    detailInput.InputUnitId : detailInput.InputUnitId,

                Substitutes = new List<BOMSubstitute>()
            };

            // جایگزین‌ها
            foreach (var subInput in detailInput.Substitutes)
            {
                newDetail.Substitutes.Add(new BOMSubstitute
                {
                    BOMDetailId = 0, // EF Core هندل می‌کند
                    SubstituteProductId = subInput.SubstituteProductId,
                    Priority = subInput.Priority,
                    Factor = subInput.Factor,
                    
                    // مپ کردن فیلدهای میکس (درخواست شما)
                    IsMixAllowed = subInput.IsMixAllowed,
                    MaxMixPercentage = subInput.MaxMixPercentage,
                    Note = subInput.Note
                });
            }

            bom.Details.Add(newDetail);
        }

        // 4. ذخیره نهایی
        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}