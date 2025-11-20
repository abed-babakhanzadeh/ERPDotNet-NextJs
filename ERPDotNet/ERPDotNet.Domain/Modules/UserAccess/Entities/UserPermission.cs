namespace ERPDotNet.Domain.Modules.UserAccess.Entities;

public class UserPermission
{
    public string UserId { get; set; }
    public int PermissionId { get; set; }
    
    // مهم‌ترین فیلد: آیا دسترسی داده شده (True) یا سلب شده (False)؟
    public bool IsGranted { get; set; } 

    public User User { get; set; }
    public Permission Permission { get; set; }
}