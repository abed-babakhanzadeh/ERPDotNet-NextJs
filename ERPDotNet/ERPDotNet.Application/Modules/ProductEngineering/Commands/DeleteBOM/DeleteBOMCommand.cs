using ERPDotNet.Application.Common.Attributes;
using ERPDotNet.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.ProductEngineering.Commands.DeleteBOM;

// تگ "BOMs" را باطل می‌کند
[CacheInvalidation("BOMs")] 
public record DeleteBOMCommand(int Id) : IRequest<int>; // <--- تغییر به IRequest<int>

public class DeleteBOMHandler : IRequestHandler<DeleteBOMCommand, int> // <--- اضافه شدن int
{
    private readonly IApplicationDbContext _context;

    public DeleteBOMHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<int> Handle(DeleteBOMCommand request, CancellationToken cancellationToken)
    {
        var entity = await _context.BOMHeaders
            .FirstOrDefaultAsync(x => x.Id == request.Id, cancellationToken);

        if (entity == null)
        {
            throw new KeyNotFoundException($"فرمول با شناسه {request.Id} یافت نشد.");
        }

        // Soft Delete
        entity.IsActive = false;
        entity.Status = Domain.Modules.ProductEngineering.Entities.BOMStatus.Obsolete;
        entity.IsDeleted = true; // اطمینان از حذف منطقی

        await _context.SaveChangesAsync(cancellationToken);
        
        return entity.Id; // <--- بازگرداندن ID
    }
}