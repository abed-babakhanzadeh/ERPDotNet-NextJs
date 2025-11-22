using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductPermissions : Migration
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
                    { 35, true, "BaseInfo.Products", 30, "مدیریت کالاها", "/base-info/products" },
                    { 36, false, "BaseInfo.Products.Create", 35, "تعریف کالا", null },
                    { 37, false, "BaseInfo.Products.Edit", 35, "ویرایش کالا", null },
                    { 38, false, "BaseInfo.Products.Delete", 35, "حذف کالا", null }
                });

            migrationBuilder.InsertData(
                schema: "security",
                table: "role_permissions",
                columns: new[] { "PermissionId", "RoleId" },
                values: new object[,]
                {
                    { 35, "1" },
                    { 36, "1" },
                    { 37, "1" },
                    { 38, "1" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 35, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 36, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 37, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "role_permissions",
                keyColumns: new[] { "PermissionId", "RoleId" },
                keyValues: new object[] { 38, "1" });

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 35);
        }
    }
}
