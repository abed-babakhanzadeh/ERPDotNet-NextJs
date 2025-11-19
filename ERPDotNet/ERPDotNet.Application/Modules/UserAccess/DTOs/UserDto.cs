namespace ERPDotNet.Application.Modules.UserAccess.DTOs;

public class UserDto
{
    public string Id { get; set; }
    public string Username { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string PersonnelCode { get; set; }
    public bool IsActive { get; set; }
    public string CreatedAt { get; set; } // تاریخ شمسی را بعدا هندل می‌کنیم
}