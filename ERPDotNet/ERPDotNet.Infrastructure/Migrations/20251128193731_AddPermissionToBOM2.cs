using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPermissionToBOM2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 2000,
                column: "ParentId",
                value: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 2000,
                column: "ParentId",
                value: null);
        }
    }
}
