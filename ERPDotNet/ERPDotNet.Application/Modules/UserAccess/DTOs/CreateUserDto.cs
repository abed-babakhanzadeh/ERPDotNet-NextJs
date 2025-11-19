using System.ComponentModel.DataAnnotations;

namespace ERPDotNet.Application.Modules.UserAccess.DTOs;

public class CreateUserDto
{
    [Required]
    public string FirstName { get; set; }
    [Required]
    public string LastName { get; set; }
    [Required]
    public string Username { get; set; }
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    [Required]
    public string Password { get; set; }
    public string PersonnelCode { get; set; }
}