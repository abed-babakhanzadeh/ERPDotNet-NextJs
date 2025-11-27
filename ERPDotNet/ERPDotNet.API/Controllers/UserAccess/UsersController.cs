using ERPDotNet.API.Attributes;
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
    [HasPermission("UserAccess.View")] // فقط مشاهده
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
                Username = user.UserName ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email ?? string.Empty,
                PersonnelCode = user.PersonnelCode,
                IsActive = user.IsActive,
                CreatedAt = user.CreatedAt.ToShortDateString(),
                Roles = roles // <--- ارسال نقش‌ها
            });
        }

        return Ok(userDtos);
    }


    // 1. ایجاد کاربر (Create)
    [HttpPost]
    [HasPermission("UserAccess.Create")] // فقط ایجاد
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        // بررسی تکراری نبودن نام کاربری
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

        // ساخت کاربر در دیتابیس (با پسورد)
        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors.FirstOrDefault()?.Description);

        // === اصلاحیه: اختصاص لیست نقش‌ها ===
        if (dto.Roles != null && dto.Roles.Any())
        {
            // اگر نقشی انتخاب شده، همه را یکجا اضافه کن
            // نکته: متد AddToRolesAsync (جمع) به جای AddToRoleAsync (مفرد)
            var roleResult = await _userManager.AddToRolesAsync(user, dto.Roles);
            
            if (!roleResult.Succeeded)
            {
                return Ok(new { message = "کاربر ساخته شد اما برخی نقش‌ها نامعتبر بودند", userId = user.Id });
            }
        }
        else
        {
            // اگر هیچ نقشی انتخاب نشده، نقش پیش‌فرض "User" را بده
            await _userManager.AddToRoleAsync(user, "User");
        }

        return Ok(new { message = "کاربر با موفقیت ایجاد شد", userId = user.Id });
    }

    // 2. ویرایش کاربر (Update)
    [HttpPut("{id}")]
    [HasPermission("UserAccess.Edit")]
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

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded) return BadRequest(result.Errors);

        // === اصلاحیه: آپدیت لیست نقش‌ها ===
        // فقط اگر لیست نقش‌ها ارسال شده باشد (حتی اگر خالی باشد یعنی همه نقش‌ها را بگیر)
        if (dto.Roles != null)
        {
            // 1. دریافت نقش‌های فعلی کاربر
            var currentRoles = await _userManager.GetRolesAsync(user);

            // 2. حذف تمام نقش‌های فعلی (پاکسازی)
            await _userManager.RemoveFromRolesAsync(user, currentRoles);

            // 3. افزودن نقش‌های جدید انتخاب شده
            if (dto.Roles.Any())
            {
                await _userManager.AddToRolesAsync(user, dto.Roles);
            }
        }

        return Ok(new { message = "اطلاعات کاربر ویرایش شد" });
    }

    // 2. حذف کاربر
    [HttpDelete("{id}")]
    [HasPermission("UserAccess.Delete")]
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