using System.ComponentModel.DataAnnotations;

namespace ERPDotNet.Application.Modules.UserAccess.DTOs;

public class RoleDto
{
    public string Id { get; set; }
    public string Name { get; set; }
}

public class CreateRoleDto
{
    [Required]
    public string Name { get; set; }
}