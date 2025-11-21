using ERPDotNet.Application.Modules.UserAccess.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.API.Controllers.UserAccess;

[Route("api/[controller]")]
[ApiController]
[Authorize] // بهتر است اینجا [HasPermission("UserAccess.Roles")] باشد
public class RolesController : ControllerBase
{
    private readonly RoleManager<IdentityRole> _roleManager;

    public RolesController(RoleManager<IdentityRole> roleManager)
    {
        _roleManager = roleManager;
    }

    // 1. دریافت لیست همه نقش‌ها
    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoleDto>>> GetAll()
    {
        var roles = await _roleManager.Roles
            .AsNoTracking()
            .Select(r => new RoleDto { Id = r.Id, Name = r.Name })
            .ToListAsync();

        return Ok(roles);
    }

    // 2. ایجاد نقش جدید
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRoleDto dto)
    {
        if (await _roleManager.RoleExistsAsync(dto.Name))
            return BadRequest("این نقش قبلاً تعریف شده است.");

        var result = await _roleManager.CreateAsync(new IdentityRole(dto.Name));

        if (!result.Succeeded)
            return BadRequest(result.Errors.FirstOrDefault()?.Description);

        return Ok(new { message = "نقش جدید ایجاد شد" });
    }

    // 3. حذف نقش
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var role = await _roleManager.FindByIdAsync(id);
        if (role == null) return NotFound("نقش یافت نشد");

        // جلوگیری از حذف نقش‌های سیستمی حیاتی
        if (role.Name == "Admin" || role.Name == "User")
        {
            return BadRequest("حذف نقش‌های سیستمی مجاز نیست.");
        }

        var result = await _roleManager.DeleteAsync(role);
        if (!result.Succeeded) return BadRequest(result.Errors.FirstOrDefault()?.Description);

        return Ok(new { message = "نقش با موفقیت حذف شد" });
    }
}