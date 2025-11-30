using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBomReportsPermission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 201,
                column: "Url",
                value: "/product-engineering/bom-create");

            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 202,
                column: "Url",
                value: "/product-engineering/bom-reports");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 201,
                column: "Url",
                value: null);

            migrationBuilder.UpdateData(
                schema: "security",
                table: "permissions",
                keyColumn: "Id",
                keyValue: 202,
                column: "Url",
                value: null);
        }
    }
}
