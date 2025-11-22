using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameProductUnitId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_products_units_BaseUnitId",
                schema: "base",
                table: "products");

            migrationBuilder.RenameColumn(
                name: "BaseUnitId",
                schema: "base",
                table: "products",
                newName: "UnitId");

            migrationBuilder.RenameIndex(
                name: "IX_products_BaseUnitId",
                schema: "base",
                table: "products",
                newName: "IX_products_UnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_products_units_UnitId",
                schema: "base",
                table: "products",
                column: "UnitId",
                principalSchema: "base",
                principalTable: "units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_products_units_UnitId",
                schema: "base",
                table: "products");

            migrationBuilder.RenameColumn(
                name: "UnitId",
                schema: "base",
                table: "products",
                newName: "BaseUnitId");

            migrationBuilder.RenameIndex(
                name: "IX_products_UnitId",
                schema: "base",
                table: "products",
                newName: "IX_products_BaseUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_products_units_BaseUnitId",
                schema: "base",
                table: "products",
                column: "BaseUnitId",
                principalSchema: "base",
                principalTable: "units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
