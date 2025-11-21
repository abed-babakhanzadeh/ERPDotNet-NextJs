public class UpdateRolePermissionsDto
{
    public string RoleId { get; set; }
    public List<int> PermissionIds { get; set; } // لیست آیدی‌هایی که تیک خورده‌اند
}