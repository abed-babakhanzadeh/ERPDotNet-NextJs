using ERPDotNet.Application.Modules.UserAccess.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ERPDotNet.API.Controllers.UserAccess;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    // GET: api/Permissions/tree
    // کاربرد: نمایش درخت در فرم مدیریت نقش‌ها یا کاربر
    [HttpGet("tree")]
    public async Task<IActionResult> GetTree()
    {
        var tree = await _permissionService.GetAllPermissionsTreeAsync();
        return Ok(tree);
    }

    // GET: api/Permissions/mine
    // کاربرد: فرانت‌‌اند این را صدا می‌زند تا بداند چه منوهایی را نشان دهد
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyPermissions()
    {
        // استخراج آیدی کاربر از توکن
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var permissions = await _permissionService.GetUserPermissionsAsync(userId);
        return Ok(permissions);
    }
}