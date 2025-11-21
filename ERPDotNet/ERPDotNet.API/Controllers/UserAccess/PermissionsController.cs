using ERPDotNet.API.Attributes; // <--- ایمپورت سیستم امنیتی جدید
using ERPDotNet.Application.Modules.UserAccess.DTOs;
using ERPDotNet.Application.Modules.UserAccess.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ERPDotNet.API.Controllers.UserAccess;

[Route("api/[controller]")]
[ApiController]
[Authorize] // همه متدها حداقل نیاز به لاگین دارند
public class PermissionsController : ControllerBase
{
    private readonly IPermissionService _permissionService;

    public PermissionsController(IPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    // 1. دریافت مجوزهای خود کاربر (برای سایدبار و گاردها)
    // ⚠️ نکته: این متد نباید HasPermission داشته باشد! چون هر کاربری (حتی انباردار) نیاز دارد مجوزهای خودش را بداند.
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyPermissions()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var permissions = await _permissionService.GetUserPermissionsAsync(userId);
        return Ok(permissions);
    }

    // 2. دریافت درخت کامل (برای مودال‌ها)
    // این متد معمولاً توسط کسانی استفاده می‌شود که می‌خواهند دسترسی بدهند (ادمین‌ها)
    // می‌توانیم روی دسترسی کلی "UserAccess" قفل کنیم یا باز بگذاریم (چون فقط لیست است و خطرناک نیست)
    // اما برای محکم‌کاری، دسترسی مشاهده کاربران را می‌خواهیم
    [HttpGet("tree")]
    [HasPermission("UserAccess.View")] 
    public async Task<IActionResult> GetTree()
    {
        var tree = await _permissionService.GetAllPermissionsTreeAsync();
        return Ok(tree);
    }

    // 3. دریافت دسترسی‌های یک نقش خاص
    [HttpGet("role/{roleId}")]
    [HasPermission("UserAccess.Roles")] // فقط کسی که به مدیریت نقش‌ها دسترسی دارد
    public async Task<IActionResult> GetRolePermissions(string roleId)
    {
        var permissionIds = await _permissionService.GetPermissionsByRoleAsync(roleId);
        return Ok(permissionIds);
    }

    // 4. ذخیره دسترسی‌های نقش (خطرناک!)
    [HttpPost("assign-role")]
    [HasPermission("UserAccess.Roles.Edit")] // فقط کسی که مجوز ویرایش نقش دارد
    public async Task<IActionResult> AssignPermissionsToRole([FromBody] UpdateRolePermissionsDto dto)
    {
        await _permissionService.AssignPermissionsToRoleAsync(dto.RoleId, dto.PermissionIds);
        return Ok(new { message = "دسترسی‌های نقش با موفقیت بروزرسانی شد" });
    }

    // 5. ذخیره دسترسی ویژه کاربر (خطرناک!)
    [HttpPost("assign-user")]
    [HasPermission("UserAccess.SpecialPermissions")] // مجوز جدیدی که ساختیم
    public async Task<IActionResult> AssignPermissionsToUser([FromBody] UpdateUserPermissionsDto dto)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        // (اینجا میشه چک کرد کاربر به خودش دسترسی نده، ولی فعلا ساده میگیریم)

        await _permissionService.AssignPermissionsToUserAsync(dto.UserId, dto.Permissions);
        return Ok(new { message = "دسترسی‌های ویژه کاربر ذخیره شد" });
    }

    // 6. دریافت جزئیات رنگی کاربر
    [HttpGet("user-detail/{userId}")]
    [HasPermission("UserAccess.SpecialPermissions")] // چون در مودال ویژه استفاده می‌شود
    public async Task<ActionResult<UserPermissionDetailDto>> GetUserPermissionDetails(string userId)
    {
        var result = await _permissionService.GetUserPermissionDetailsAsync(userId);
        return Ok(result);
    }

    // 7. کپی دسترسی (خطرناک!)
    [HttpPost("copy")]
    [HasPermission("UserAccess.SpecialPermissions")]
    public async Task<IActionResult> CopyPermissions([FromBody] CopyPermissionsDto dto)
    {
        if (dto.SourceUserId == dto.TargetUserId)
            return BadRequest("کاربر مبدا و مقصد نمی‌تواند یکسان باشد.");

        await _permissionService.CopyUserPermissionsAsync(dto.SourceUserId, dto.TargetUserId);
        return Ok(new { message = "دسترسی‌ها با موفقیت کپی شد" });
    }
    
    // 8. متد قدیمی (اگر هنوز استفاده می‌شود)
    [HttpGet("user/{userId}")]
    [HasPermission("UserAccess.SpecialPermissions")]
    public async Task<IActionResult> GetUserDirectPermissions(string userId)
    {
        var ids = await _permissionService.GetDirectPermissionsByUserAsync(userId);
        return Ok(ids);
    }
}