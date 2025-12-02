using ERPDotNet.Application.Common.Extensions;
using ERPDotNet.Application.Common.Interfaces;
using ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllProducts;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Application.Modules.BaseInfo.Queries.GetProductById;

public class GetProductByIdQueryHandler : IRequestHandler<GetProductByIdQuery, ProductDto?>
{
    private readonly IApplicationDbContext _context;

    public GetProductByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<ProductDto?> Handle(GetProductByIdQuery request, CancellationToken cancellationToken)
    {
        // استفاده از Select برای تبدیل مستقیم Entity به DTO در سطح دیتابیس
        // این روش دقیقا مثل GetAllProductsHandler شماست و نیازی به AutoMapper ندارد
        var productDto = await _context.Products
            .AsNoTracking()
            .Where(p => p.Id == request.Id)
            .Select(p => new ProductDto(
                p.Id,
                p.Code,
                p.Name,
                p.UnitId,
                p.Unit != null ? p.Unit.Title : "", // هندل کردن نال بودن واحد
                (int)p.SupplyType,
                p.SupplyType.ToDisplay(), // استفاده از اکستنشن متد شما
                p.ImagePath,
                p.UnitConversions.Select(c => new ProductConversionDto(
                    c.Id,
                    c.AlternativeUnitId,
                    c.AlternativeUnit != null ? c.AlternativeUnit.Title : "",
                    c.Factor
                )).ToList()
            ))
            .FirstOrDefaultAsync(cancellationToken);

        return productDto;
    }
}