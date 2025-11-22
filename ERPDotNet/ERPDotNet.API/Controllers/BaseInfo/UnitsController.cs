using ERPDotNet.API.Attributes; // برای امنیت
using ERPDotNet.Application.Modules.BaseInfo.Commands.CreateUnit;
using ERPDotNet.Application.Modules.BaseInfo.Queries.GetAllUnits;
using MediatR;
using Microsoft.AspNetCore.Mvc;

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
    [HasPermission("BaseInfo.Units.Create")] // امنیت ریزدانه
    public async Task<IActionResult> Create([FromBody] CreateUnitCommand command)
    {
        var id = await _mediator.Send(command);
        return Ok(new { id });
    }

    [HttpGet]
    [HasPermission("BaseInfo.Units.View")]
    public async Task<ActionResult<List<UnitDto>>> GetAll()
    {
        var result = await _mediator.Send(new GetAllUnitsQuery());
        return Ok(result);
    }
}