using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseInfoPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                schema: "security",
                table: "permissions",
                columns: new[] { "Id", "IsMenu", "Name", "ParentId", "Title", "Url" },
                values: new object[,]
                {
                    { 30, true, "BaseInfo", 1, "اطلاعات پایه", null },
                    { 31, true, "BaseInfo.Units", 30, "واحد سنجش", "/base-info/units" }
                });

            migrationBuilder.InsertData(
                schema: "security",
                table: "role_permissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[] { 30, "1" });

            migrationBuilder.InsertData(
                schema: "security",
                table: "permissions",
                columns: new[] { "Id", "IsMenu", "Name", "ParentId", "Title", "Url" },
                values: new object[,]
                {
                    { 32, false, "BaseInfo.Units.Create", 31, "تعریف واحد", null },
                    { 33, false, "BaseInfo.Units.Edit", 31, "ویرایش واحد", null },
                    { 34, false, "BaseInfo.Units.Delete", 31, "حذف واحد", null }
                });

            migrationBuilder.InsertData(
                schema: "security",
                table: "role_permissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { 31, "1" },
                    { 32, "1" },
                    { 33, "1" },
                    { 34, "1" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 30, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 31, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 32, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 33, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 34, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 30);
        }
    }
}
