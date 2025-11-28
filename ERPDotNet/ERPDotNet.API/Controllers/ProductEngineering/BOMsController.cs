using ERPDotNet.API.Attributes;
using ERPDotNet.Application.Modules.ProductEngineering.Commands.CreateBOM;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ERPDotNet.API.Controllers.ProductEngineering;

[Route("api/[controller]")]
[ApiController]
[HasPermission("ProductEngineering")] 
public class BOMsController : ControllerBase
{
    private readonly IMediator _mediator;

    public BOMsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // 1. ایجاد BOM جدید
    [HttpPost]
    [HasPermission("ProductEngineering.BOM.Create")] // پرمیشن را یادت نرود در دیتابیس اضافه کنی
    public async Task<IActionResult> Create([FromBody] CreateBOMCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id });
    }
}