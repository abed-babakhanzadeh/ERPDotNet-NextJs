using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Domain.Modules.BaseInfo.Entities;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.BaseInfo.Commands.UpdateUnit;

[CacheInvalidation("Units", "UnitsLookup")] // کش‌های مرتبط را می‌پراند
public record UpdateUnitCommand : IRequest<bool>
{
    public int Id { get; set; } // شناسه برای پیدا کردن رکورد
    public string Title { get; set; }
    public string Symbol { get; set; }
    public int Precision { get; set; }
    public bool IsActive { get; set; } // امکان غیرفعال کردن واحد

    // فیلدهای واحد فرعی
    public int? BaseUnitId { get; set; }
    public decimal ConversionFactor { get; set; }
}

public class UpdateUnitValidator : AbstractValidator<UpdateUnitCommand>
{
    public UpdateUnitValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.Title).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Symbol).NotEmpty().MaximumLength(10);
        RuleFor(x => x.Precision).GreaterThanOrEqualTo(0).LessThan(6);
        
        // اگر واحد پایه دارد، ضریب باید معتبر باشد
        RuleFor(x => x.ConversionFactor).GreaterThan(0);
    }
}

public class UpdateUnitHandler : IRequestHandler<UpdateUnitCommand, bool>
{
    private readonly IApplicationDbContext _context;

    public UpdateUnitHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<bool> Handle(UpdateUnitCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.Units
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            // در معماری Clean می‌توان اینجا NotFoundException پرتاب کرد
            return false; 
        }

        // آپدیت فیلدها
        entity.Title = request.Title;
        entity.Symbol = request.Symbol;
        entity.Precision = request.Precision;
        entity.IsActive = request.IsActive;
        entity.BaseUnitId = request.BaseUnitId;
        entity.ConversionFactor = request.ConversionFactor;
        
        // آپدیت فیلد Audit (اگر در SaveChanges خودکار هندل نشده باشد)
        entity.LastModifiedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync(cancellationToken);

        return true;
    }
}