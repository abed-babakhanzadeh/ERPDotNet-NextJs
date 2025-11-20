using ERPDotNet.Application.Modules.UserAccess.DTOs;
using ERPDotNet.Application.Modules.UserAccess.Interfaces;
using ERPDotNet.Domain.Modules.UserAccess.Entities; // برای پرمیشن
using ERPDotNet.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace ERPDotNet.Infrastructure.Modules.UserAccess.Services;

public class PermissionService : IPermissionService
{
    private readonly AppDbContext _context;

    public PermissionService(AppDbContext context)
    {
        _context = context;
    }

    // 1. ساخت درخت مجوزها
    public async Task<List<PermissionDto>> GetAllPermissionsTreeAsync()
    {
        // تمام پرمیشن‌ها را فلت می‌خوانیم
        var allPermissions = await _context.Permissions.ToListAsync();

        // فقط ریشه‌ها (آن‌هایی که پدر ندارند) را جدا می‌کنیم
        var roots = allPermissions.Where(p => p.ParentId == null).ToList();
        
        var result = new List<PermissionDto>();

        foreach (var root in roots)
        {
            result.Add(MapToDto(root, allPermissions));
        }

        return result;
    }

    // تابع بازگشتی برای ساخت فرزندان
    private PermissionDto MapToDto(Permission permission, List<Permission> allPermissions)
    {
        var dto = new PermissionDto
        {
            Id = permission.Id,
            Title = permission.Title,
            Name = permission.Name,
            IsMenu = permission.IsMenu
        };

        // پیدا کردن فرزندان از لیست کل
        var children = allPermissions.Where(p => p.ParentId == permission.Id).ToList();
        
        foreach (var child in children)
        {
            dto.Children.Add(MapToDto(child, allPermissions));
        }

        return dto;
    }

    // 2. فرمول محاسبه دسترسی نهایی کاربر
    public async Task<List<string>> GetUserPermissionsAsync(string userId)
    {
        // الف) لیست مجوزهای ناشی از نقش‌های کاربر
        // (User -> UserRoles -> Role -> RolePermissions -> Permission)
        var rolePermissions = await _context.UserRoles
            .Where(ur => ur.UserId == userId)
            .Join(_context.RolePermissions,
                ur => ur.RoleId,
                rp => rp.RoleId,
                (ur, rp) => rp.Permission.Name) // فقط نام پرمیشن را می‌خواهیم
            .ToListAsync();

        // ب) لیست مجوزهای مستقیم کاربر (UserPermissions)
        var directPermissions = await _context.UserPermissions
            .Where(up => up.UserId == userId)
            .Select(up => new { up.Permission.Name, up.IsGranted })
            .ToListAsync();

        // ج) ترکیب و محاسبه نهایی
        // شروع با مجوزهای نقش
        var finalPermissions = new HashSet<string>(rolePermissions);

        foreach (var direct in directPermissions)
        {
            if (direct.IsGranted)
            {
                // اگر مستقیم داده شده، اضافه کن (Union)
                finalPermissions.Add(direct.Name);
            }
            else
            {
                // اگر مستقیم سلب شده (IsGranted = false)، حذف کن (Even if role has it)
                finalPermissions.Remove(direct.Name);
            }
        }

        return finalPermissions.ToList();
    }
}