using ERPDotNet.API.Attributes;
using ERPDotNet.Application.Common.Models;
using ERPDotNet.Application.Modules.BaseInfo.Commands.CreateProduct;
using ERPDotNet.Application.Modules.BaseInfo.Commands.DeleteProduct;
using ERPDotNet.Application.Modules.BaseInfo.Commands.UpdateProduct;
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

    [HttpPost("search")] // تغییر به POST
    [HasPermission("BaseInfo.Products")]
    public async Task<ActionResult<PaginatedResult<ProductDto>>> GetAll([FromBody] GetAllProductsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("{id}")]
    [HasPermission("BaseInfo.Products.Edit")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateProductCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID در URL با بدنه درخواست همخوانی ندارد.");
        }

        var result = await _mediator.Send(command);
        
        if (!result) return NotFound();

        return Ok(new { success = true });
    }

    [HttpDelete("{id}")]
    [HasPermission("BaseInfo.Products.Delete")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteProductCommand(id));

        if (!result) return NotFound();

        return Ok(new { success = true });
    }
}
