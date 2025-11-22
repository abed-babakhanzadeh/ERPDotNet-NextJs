using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class EditRolesPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Name", "Title" },
                values: new object[] { "UserAccess.Roles.Delete", "حذف نقش" });

            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Name", "ParentId", "Title" },
                values: new object[] { "UserAccess.Roles.Edit", 7, "ویرایش دسترسی‌ها" });

            migrationBuilder.InsertData(
                schema: "security",
                table: "permissions",
                columns: new[] { "Id", "IsMenu", "Name", "ParentId", "Title", "Url" },
                values: new object[] { 11, false, "UserAccess.SpecialPermissions", 2, "مدیریت دسترسی‌های ویژه", null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 11);

            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 9,
                columns: new[] { "Name", "Title" },
                values: new object[] { "UserAccess.Roles.Edit", "ویرایش دسترسی‌ها" });

            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 10,
                columns: new[] { "Name", "ParentId", "Title" },
                values: new object[] { "UserAccess.SpecialPermissions", 2, "مدیریت دسترسی‌های ویژه" });
        }
    }
}
