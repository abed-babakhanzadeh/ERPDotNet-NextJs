using ERPDotNet.Application.Modules.UserAccess.DTOs;
using ERPDotNet.Domain.Modules.UserAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.API.Controllers.UserAccess;

[Route("api/[controller]")]
[ApiController]
[Authorize] // فقط افراد لاگین شده دسترسی دارند
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public UsersController(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetAll()
    {
        // دریافت یوزرها به همراه نقش‌هایشان (نیاز به Join دارد)
        // روش استاندارد LINQ برای گرفتن یوزر + نقش در Identity:
        var users = await _userManager.Users.AsNoTracking().ToListAsync();
        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            // نکته: در سیستم‌های خیلی بزرگ این قسمت باید با Join نوشته شود تا N+1 نشود
            // اما برای شروع و تعداد زیر ۱۰ هزار یوزر، این روش خواناتر است.
            var roles = await _userManager.GetRolesAsync(user);
            
            userDtos.Add(new UserDto
            {
                Id = user.Id,
                Username = user.UserName,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PersonnelCode = user.PersonnelCode,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt.ToShortDateString(),
                Roles = roles // <--- ارسال نقش‌ها
            });
        }

        return Ok(userDtos);
    }


    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        if (await _userManager.FindByNameAsync(dto.Username) != null)
            return BadRequest("این نام کاربری قبلاً استفاده شده است.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            UserName = dto.Username,
            Email = dto.Email,
            PersonnelCode = dto.PersonnelCode,
            IsActive = true,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors.FirstOrDefault()?.Description);

        // === اختصاص نقش ===
        // اگر نقشی که فرانت فرستاده معتبر باشد، به یوزر می‌دهیم
        var roleResult = await _userManager.AddToRoleAsync(user, dto.Role);
        
        if (!roleResult.Succeeded)
        {
            // اگر نقش پیدا نشد، لاگ می‌اندازیم ولی یوزر ساخته شده
            return Ok(new { message = "کاربر ساخته شد اما نقش نامعتبر بود", userId = user.Id });
        }

        return Ok(new { message = "کاربر با موفقیت ایجاد شد", userId = user.Id });
    }


    // 1. ویرایش کاربر
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound("کاربر یافت نشد");

        // آپدیت فیلدهای ساده
        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Email = dto.Email;
        user.PersonnelCode = dto.PersonnelCode;
        user.IsActive = dto.IsActive;

        // آپدیت در دیتابیس
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        // === آپدیت نقش (کمی پیچیده است) ===
        if (!string.IsNullOrEmpty(dto.Role))
        {
            // نقش‌های قبلی را می‌گیریم
            var currentRoles = await _userManager.GetRolesAsync(user);
            // حذف همه نقش‌های قبلی
            await _userManager.RemoveFromRolesAsync(user, currentRoles);
            // افزودن نقش جدید
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        return Ok(new { message = "اطلاعات کاربر ویرایش شد" });
    }

    // 2. حذف کاربر
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound("کاربر یافت نشد");

        // جلوگیری از خودزنی (ادمین خودش را پاک نکند!)
        // نکته: این User.Identity.Name نام کاربری کسی است که لاگین کرده
        if (user.UserName == User.Identity?.Name)
        {
            return BadRequest("شما نمی‌توانید حساب خودتان را حذف کنید!");
        }

        // حذف فیزیکی (Hard Delete)
        // نکته: در ERP واقعی معمولا user.IsDeleted = true می‌کنیم (Soft Delete)
        var result = await _userManager.DeleteAsync(user);
        
        if (!result.Succeeded) return BadRequest(result.Errors);

        return Ok(new { message = "کاربر حذف شد" });
    }
}