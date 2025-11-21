using ERPDotNet.Application.Modules.UserAccess.DTOs;
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

    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignPermissionsToRole([FromBody] UpdateRolePermissionsDto dto)
    {
        // لاجیک دیتابیس حذف شد و به سرویس منتقل شد
        await _permissionService.AssignPermissionsToRoleAsync(dto.RoleId, dto.PermissionIds);

        return Ok(new { message = "دسترسی‌های نقش با موفقیت بروزرسانی شد" });
    }

    [HttpGet("role/{roleId}")]
    public async Task<IActionResult> GetRolePermissions(string roleId)
    {
        var permissionIds = await _permissionService.GetPermissionsByRoleAsync(roleId);
        return Ok(permissionIds);
    }

    // ذخیره دسترسی ویژه کاربر
    [HttpPost("assign-user")]
    public async Task<IActionResult> AssignPermissionsToUser([FromBody] UpdateUserPermissionsDto dto)
    {
        // پاس دادن لیست جدید به سرویس
        await _permissionService.AssignPermissionsToUserAsync(dto.UserId, dto.Permissions);
        return Ok(new { message = "دسترسی‌های ویژه کاربر ذخیره شد" });
    }

    // دریافت دسترسی‌های ویژه کاربر
    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserDirectPermissions(string userId)
    {
        var ids = await _permissionService.GetDirectPermissionsByUserAsync(userId);
        return Ok(ids);
    }

    // GET: api/Permissions/user-detail/{userId}
    [HttpGet("user-detail/{userId}")]
    public async Task<ActionResult<UserPermissionDetailDto>> GetUserPermissionDetails(string userId)
    {
        var result = await _permissionService.GetUserPermissionDetailsAsync(userId);
        return Ok(result);
    }

    [HttpPost("copy")]
    public async Task<IActionResult> CopyPermissions([FromBody] CopyPermissionsDto dto)
    {
        if (dto.SourceUserId == dto.TargetUserId)
            return BadRequest("کاربر مبدا و مقصد نمی‌تواند یکسان باشد.");

        await _permissionService.CopyUserPermissionsAsync(dto.SourceUserId, dto.TargetUserId);
        return Ok(new { message = "دسترسی‌ها با موفقیت کپی شد" });
    }
    
}