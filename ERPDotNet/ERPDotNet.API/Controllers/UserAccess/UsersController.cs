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
        var users = await _userManager.Users
            .AsNoTracking() // افزایش سرعت خواندن
            .Select(u => new UserDto
            {
                Id = u.Id,
                Username = u.UserName,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                PersonnelCode = u.PersonnelCode,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt.ToShortDateString() // فعلا تاریخ میلادی ساده
            })
            .ToListAsync();

        return Ok(users);
    }


    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
    {
        // بررسی تکراری نبودن
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
            EmailConfirmed = true // چون ادمین می‌سازد، تایید شده فرض می‌کنیم
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors.FirstOrDefault()?.Description);

        return Ok(new { message = "کاربر با موفقیت ایجاد شد", userId = user.Id });
    }
}