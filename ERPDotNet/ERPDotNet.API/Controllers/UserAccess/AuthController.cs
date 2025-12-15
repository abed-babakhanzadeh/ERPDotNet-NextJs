using ERPDotNet.Application.Modules.UserAccess.DTOs;
using ERPDotNet.Application.Modules.UserAccess.Interfaces;
using ERPDotNet.Domain.Modules.UserAccess.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ERPDotNet.API.Controllers.UserAccess;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;

    public AuthController(UserManager<User> userManager, ITokenService tokenService)
    {
        _userManager = userManager;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        if (await _userManager.FindByNameAsync(dto.Username) != null)
            return BadRequest("این نام کاربری قبلا گرفته شده است.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            UserName = dto.Username,
            Email = dto.Email,
            NationalCode = dto.NationalCode,
            PersonnelCode = "EMP-" + new Random().Next(1000, 9999).ToString(),
            IsActive = true
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
            return BadRequest(result.Errors);

        // === اصلاحیه: اختصاص نقش پیش‌فرض "User" ===
        await _userManager.AddToRoleAsync(user, "User"); 
        // ===========================================

        // تولید توکن (حالا که نقش دارد، نقش در توکن هم قرار می‌گیرد)
        // دوباره نقش‌ها را می‌گیریم تا مطمئن شویم
        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, roles);

        return Ok(new { User = user.UserName, Token = token });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var user = await _userManager.FindByNameAsync(dto.Username);
        if (user == null)
            return Unauthorized("نام کاربری یا رمز عبور اشتباه است.");

        var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!isPasswordValid)
            return Unauthorized("نام کاربری یا رمز عبور اشتباه است.");

        var roles = await _userManager.GetRolesAsync(user);
        var token = _tokenService.GenerateToken(user, roles);

        return Ok(new { Token = token, Message = "Login successful" });
    }

    [HttpGet("profile")]
    [Authorize]
    // تغییر خروجی به ActionResult<UserDto>
    public async Task<ActionResult<UserDto>> GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized("کاربر یافت نشد.");

        // استفاده از DTO واقعی
        var userDto = new UserDto
        {
            Id = user.Id,
            Username = user.UserName!,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email!,
            PersonnelCode = user.PersonnelCode,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt.ToString("yyyy/MM/dd"), // یا تبدیل به شمسی
            Roles = (await _userManager.GetRolesAsync(user)).ToList()
        };

        return Ok(userDto);
    }
}