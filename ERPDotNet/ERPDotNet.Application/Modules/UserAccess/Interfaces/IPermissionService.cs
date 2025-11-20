using ERPDotNet.Application.Modules.UserAccess.DTOs;

namespace ERPDotNet.Application.Modules.UserAccess.Interfaces;

public interface IPermissionService
{
    // دریافت لیست کامل مجوزها به صورت درختی (برای پنل ادمین و تیک زدن)
    Task<List<PermissionDto>> GetAllPermissionsTreeAsync();

    // محاسبه و دریافت لیست مجوزهای نهایی یک کاربر خاص (فرمول اصلی)
    Task<List<string>> GetUserPermissionsAsync(string userId);
}