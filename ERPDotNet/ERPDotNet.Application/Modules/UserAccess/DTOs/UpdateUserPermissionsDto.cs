using System.Collections.Generic;

namespace ERPDotNet.Application.Modules.UserAccess.DTOs;

public class UpdateUserPermissionsDto
{
    public string UserId { get; set; }
    public List<UserPermissionOverrideInput> Permissions { get; set; }
}