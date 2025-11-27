namespace ERPDotNet.Application.Modules.UserAccess.DTOs;

public class UserDto
{
    public required string Id { get; set; }
    public required string Username { get; set; }
    public required string FirstName { get; set; }
    public required string LastName { get; set; }
    public required string Email { get; set; }
    public string? PersonnelCode { get; set; }
    public IList<string>? Roles { get; set; }
    public bool IsActive { get; set; }
    public string? CreatedAt { get; set; } // تاریخ شمسی را بعدا هندل می‌کنیم
}