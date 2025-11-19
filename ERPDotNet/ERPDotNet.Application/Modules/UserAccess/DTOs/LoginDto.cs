using System.ComponentModel.DataAnnotations;

namespace ERPDotNet.Application.Modules.UserAccess.DTOs;

public class LoginDto
{
    [Required]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}