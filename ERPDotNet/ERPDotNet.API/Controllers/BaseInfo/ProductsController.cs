using ERPDotNet.API.Attributes;
using ERPDotNet.Application.Modules.BaseInfo.Commands.CreateProduct;
using ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllProducts;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPDotNet.API.Controllers.BaseInfo;

[Route("api/[controller]")]
[ApiController]
public class ProductsController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [HasPermission("BaseInfo.Products.Create")]
    public async Task<IActionResult> Create([FromBody] CreateProductCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id });
    }

    [HttpGet]
    [HasPermission("BaseInfo.Products")] // دسترسی مشاهده
    public async Task<ActionResult<List<ProductDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetAllProductsQuery());
        return Ok(result);
    }
}