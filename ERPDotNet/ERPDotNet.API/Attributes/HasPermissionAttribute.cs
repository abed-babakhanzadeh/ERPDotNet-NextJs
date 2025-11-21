using ERPDotNet.Application.Modules.UserAccess.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace ERPDotNet.API.Attributes;

[AttributeUsage(AttributeTargets.Method | AttributeTargets.Class)]
public class HasPermissionAttribute : TypeFilterAttribute
{
    public HasPermissionAttribute(string permission) : base(typeof(HasPermissionFilter))
    {
        Arguments = new object[] { permission };
    }
}

public class HasPermissionFilter : IAuthorizationFilter
{
    private readonly string _permission;
    private readonly IPermissionService _permissionService;

    public HasPermissionFilter(string permission, IPermissionService permissionService)
    {
        _permission = permission;
        _permissionService = permissionService;
    }

    public void OnAuthorization(AuthorizationFilterContext context)
    {
        // 1. آیا کاربر لاگین کرده؟
        if (!context.HttpContext.User.Identity.IsAuthenticated)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // 2. دریافت آیدی کاربر
        var userId = context.HttpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // 3. دریافت لیست مجوزهای کاربر از سرویس (همان متدی که نوشتیم)
        // نکته: چون این متد Async است و اینجا Sync، باید با GetAwaiter صدا بزنیم
        // (در .NET های جدیدتر IAsyncAuthorizationFilter هم داریم که بهتر است)
        var userPermissions = _permissionService.GetUserPermissionsAsync(userId).GetAwaiter().GetResult();

        // 4. چک کردن مجوز
        if (!userPermissions.Contains(_permission))
        {
            // اگر نداشت، خطای 403 Forbidden بده
            context.Result = new ForbidResult();
        }
    }
}