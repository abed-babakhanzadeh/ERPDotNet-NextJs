using ERPDotNet.API.Attributes;
using ERPDotNet.Application.Common.Models;
using ERPDotNet.Application.Modules.BaseInfo.Commands.CreateUnit;
using ERPDotNet.Application.Modules.BaseInfo.Commands.UpdateUnit; // اضافه شد
using ERPDotNet.Application.Modules.BaseInfo.Commands.DeleteUnit; // اضافه شد
using ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllUnits;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using ERPDotNet.Application.Modules.BaseInfo.Queries.GetUnitById;

namespace ERPDotNet.API.Controllers.BaseInfo;

[Route("api/[controller]")]
[ApiController]
public class UnitsController : ControllerBase
{
    private readonly IMediator _mediator;

    public UnitsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [HasPermission("BaseInfo.Units.Create")]
    public async Task<IActionResult> Create([FromBody] CreateUnitCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id });
    }

    // === متد جدید: ویرایش ===
    [HttpPut("{id}")]
    [HasPermission("BaseInfo.Units.Edit")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateUnitCommand command)
    {
        if (id != command.Id)
        {
            return BadRequest("ID in url and body must match");
        }

        var result = await _mediator.Send(command);
        
        if (!result) return NotFound();

        return Ok(new { success = true });
    }

    // === متد جدید: حذف ===
    [HttpDelete("{id}")]
    [HasPermission("BaseInfo.Units.Delete")]
    public async Task<IActionResult> Delete(int id)
    {
        var result = await _mediator.Send(new DeleteUnitCommand(id));
        
        if (!result) return NotFound();

        return Ok(new { success = true });
    }

    [HttpPost("search")]
    [HasPermission("BaseInfo.Units")]
    public async Task<ActionResult<PaginatedResult<UnitDto>>> Search([FromBody] GetAllUnitsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<List<UnitDto>>> GetLookup()
    {
        var result = await _mediator.Send(new GetUnitsLookupQuery());
        return Ok(result);
    }

    // متد جدید برای دریافت تکی واحد
    [HttpGet("{id}")]
    [HasPermission("BaseInfo.Units")]
    public async Task<ActionResult<UnitDto>> GetById(int id)
    {
        var query = new GetUnitByIdQuery(id);
        var result = await _mediator.Send(query);

        if (result == null) return NotFound();

        return Ok(result);
    }
}