using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Modules.BaseInfo.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.BaseInfo.Commands.UpdateProduct;

[CacheInvalidation("Products")] // باطل کردن کش لیست کالاها
public record UpdateProductCommand : IRequest<bool>
{
    public int Id { get; set; }
    public required string Code { get; set; }
    public required string Name { get; set; }
    public string? TechnicalSpec { get; set; }
    public required int UnitId { get; set; }
    public ProductSupplyType SupplyType { get; set; }
    public bool IsActive { get; set; }

    // لیست تبدیل‌ها برای ویرایش
    public List<ProductConversionUpdateDto> Conversions { get; set; } = new();
}

public class ProductConversionUpdateDto
{
    // اگر ID بفرستد یعنی می‌خواهد این سطر را آپدیت کند
    // اگر 0 بفرستد یعنی جدید است
    public int? Id { get; set; } 
    public int AlternativeUnitId { get; set; }
    public decimal Factor { get; set; }
}

public class UpdateProductValidator : AbstractValidator<UpdateProductCommand>
{
    private readonly IApplicationDbContext _context;

    public UpdateProductValidator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(v => v.Id).GreaterThan(0);

        RuleFor(v => v.Code).NotEmpty().MaximumLength(50)
            .MustAsync(BeUniqueCode).WithMessage("این کد کالا قبلاً برای محصول دیگری ثبت شده است.");

        RuleFor(v => v.Name).NotEmpty().MaximumLength(200);
        RuleFor(v => v.UnitId).GreaterThan(0);

        RuleForEach(v => v.Conversions).ChildRules(c => {
            c.RuleFor(x => x.AlternativeUnitId).GreaterThan(0);
            c.RuleFor(x => x.Factor).GreaterThan(0);
        });
    }

    // چک کردن یکتایی کد (باید رکوردهای دیگر را چک کند، نه خودش را)
    private async Task<bool> BeUniqueCode(UpdateProductCommand model, string code, CancellationToken cancellationToken)
    {
        return !await _context.Products
            .AnyAsync(p => p.Code == code && p.Id != model.Id, cancellationToken);
    }
}

public class UpdateProductHandler : IRequestHandler<UpdateProductCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateProductHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
    {
        // 1. لود کردن کالا همراه با فرزندان (تبدیل‌ها)
        var entity = await _context.Products
            .Include(p => p.UnitConversions)
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (entity == null) return false;

        // 2. آپدیت فیلدهای ساده
        entity.Code = request.Code;
        entity.Name = request.Name;
        entity.TechnicalSpec = request.TechnicalSpec;
        entity.UnitId = request.UnitId;
        entity.SupplyType = request.SupplyType;
        entity.IsActive = request.IsActive;

        // 3. مدیریت هوشمند لیست فرزندان (Smart Sync)
        
        // الف) حذف موارد حذف شده:
        // تبدیل‌هایی که در دیتابیس هستند اما در لیست ورودی نیستند
        var requestConversionIds = request.Conversions
            .Where(c => c.Id.HasValue && c.Id.Value > 0)
            .Select(c => c.Id!.Value)
            .ToList();

        var toDelete = entity.UnitConversions
            .Where(c => !requestConversionIds.Contains(c.Id))
            .ToList();

        foreach (var item in toDelete)
        {
            // سافت دیلیت برای جدول واسط معمولا لازم نیست، اما اگر بخواهید می‌توانید IsDeleted کنید
            // اینجا فیزیکی از لیست حذف می‌کنیم (چون Composition است)
            _context.ProductUnitConversions.Remove(item);
        }

        // ب) افزودن یا ویرایش موارد
        foreach (var convDto in request.Conversions)
        {
            if (convDto.Id.HasValue && convDto.Id.Value > 0)
            {
                // --- ویرایش موجود ---
                var existingConv = entity.UnitConversions
                    .FirstOrDefault(c => c.Id == convDto.Id.Value);

                if (existingConv != null)
                {
                    existingConv.AlternativeUnitId = convDto.AlternativeUnitId;
                    existingConv.Factor = convDto.Factor;
                }
            }
            else
            {
                // --- افزودن جدید ---
                entity.UnitConversions.Add(new ProductUnitConversion
                {
                    AlternativeUnitId = convDto.AlternativeUnitId,
                    Factor = convDto.Factor
                });
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}