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

        // تولید توکن برای ورود خودکار بعد از ثبت نام
        var token = _tokenService.GenerateToken(user, new List<string>());

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
    public IActionResult GetProfile()
    {
        var username = User.FindFirst(ClaimTypes.Name)?.Value;
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var personnelCode = User.FindFirst("PersonnelCode")?.Value;

        return Ok(new
        {
            Id = userId,
            Username = username,
            PersonnelCode = personnelCode,
            ServerTime = DateTime.Now
        });
    }
}