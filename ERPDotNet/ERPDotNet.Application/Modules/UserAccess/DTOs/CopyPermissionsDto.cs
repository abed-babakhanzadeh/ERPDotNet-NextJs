namespace ERPDotNet.Application.Modules.UserAccess.DTOs;

public class CopyPermissionsDto
{
    public string SourceUserId { get; set; } // کاربری که از رویش کپی می‌کنیم
    public string TargetUserId { get; set; } // کاربری که داریم ویرایشش می‌کنیم
}