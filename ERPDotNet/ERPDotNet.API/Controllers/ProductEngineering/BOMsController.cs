using ERPDotNet.API.Attributes;
using ERPDotNet.Application.Common.Models;
using ERPDotNet.Application.Modules.ProductEngineering.Commands.CopyBOM;
using ERPDotNet.Application.Modules.ProductEngineering.Commands.CreateBOM;
using ERPDotNet.Application.Modules.ProductEngineering.Commands.DeleteBOM;
using ERPDotNet.Application.Modules.ProductEngineering.Queries.GetBOM;
using ERPDotNet.Application.Modules.ProductEngineering.Queries.GetBOMsList;
using ERPDotNet.Application.Modules.ProductEngineering.Queries.GetBOMTree;
using ERPDotNet.Application.Modules.ProductEngineering.Queries.GetWhereUsed;
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

    [HttpGet("{id}")]
    [HasPermission("ProductEngineering.BOM")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _mediator.Send(new GetBOMQuery(id));
        
        if (result == null) return NotFound();
        
        return Ok(result);
    }

    [HttpPost("search")]
    [HasPermission("ProductEngineering.BOM")]
    public async Task<ActionResult<PaginatedResult<BOMListDto>>> Search([FromBody] GetBOMsListQuery query)
    {
        return Ok(await _mediator.Send(query));
    }

    [HttpGet("{id}/tree")]
    [HasPermission("ProductEngineering.BOM")]
    public async Task<IActionResult> GetTree(int id)
    {
        var result = await _mediator.Send(new GetBOMTreeQuery(id));
        
        if (result == null) return NotFound();
        
        return Ok(result);
    }

    // گزارش "کجا مصرف شده"
    [HttpPost("where-used")]
    [HasPermission("ProductEngineering.BOM.Reports")]
    public async Task<ActionResult<PaginatedResult<WhereUsedDto>>> GetWhereUsed([FromBody] GetWhereUsedQuery query)
    {
        return Ok(await _mediator.Send(query));
    }

    // کپی کردن BOM
    [HttpPost("{id}/copy")]
    [HasPermission("ProductEngineering.BOM.Create")] // دسترسی ایجاد نیاز دارد
    public async Task<IActionResult> Copy(int id, [FromBody] CopyBOMCommand command)
    {
        if (id != command.SourceBomId)
            return BadRequest("ID در URL با بدنه درخواست همخوانی ندارد");

        var newId = await _mediator.Send(command);
        return Ok(new { id = newId });
    }

    // --- متد جدید حذف ---
    [HttpDelete("{id}")]
    [HasPermission("ProductEngineering.BOM.Create")]
    public async Task<IActionResult> Delete(int id)
    {
        // حالا این متد یک int برمی‌گرداند، که پایپ‌لاین کش را فعال می‌کند
        await _mediator.Send(new DeleteBOMCommand(id));
        
        return NoContent();
    }

    
}