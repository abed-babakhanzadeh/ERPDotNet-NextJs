using ERPDotNet.API.Attributes; // برای امنیت
using ERPDotNet.Application.Common.Models;
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

    // 1. مخصوص جدول (سنگین و صفحه‌بندی شده)
    [HttpPost("search")]
    [HasPermission("BaseInfo.Units")]
    public async Task<ActionResult<PaginatedResult<UnitDto>>> Search([FromBody] GetAllUnitsQuery query)
    {
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    // 2. مخصوص دراپ‌داون (سبک و سریع)
    // این همان آدرس قدیمی GET /api/Units است که فرم کالا صدا می‌زند
    [HttpGet]
    // [HasPermission("BaseInfo.Units")] <--- برای دراپ‌داون معمولاً سخت‌گیری کمتری می‌کنیم یا پرمیشن عمومی می‌گذاریم
    public async Task<ActionResult<List<UnitDto>>> GetLookup()
    {
        var result = await _mediator.Send(new GetUnitsLookupQuery());
        return Ok(result);
    }
}