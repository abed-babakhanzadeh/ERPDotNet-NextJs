using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductModule_Final : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_products_units_SecondaryUnitId",
                schema: "base",
                table: "products");

            migrationBuilder.DropForeignKey(
                name: "FK_products_units_UnitId",
                schema: "base",
                table: "products");

            migrationBuilder.DropIndex(
                name: "IX_products_SecondaryUnitId",
                schema: "base",
                table: "products");

            migrationBuilder.DropColumn(
                name: "SecondaryUnitId",
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

            migrationBuilder.CreateTable(
                name: "product_unit_conversions",
                schema: "base",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    AlternativeUnitId = table.Column<int>(type: "integer", nullable: false),
                    Factor = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_product_unit_conversions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_product_unit_conversions_products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "base",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_product_unit_conversions_units_AlternativeUnitId",
                        column: x => x.AlternativeUnitId,
                        principalSchema: "base",
                        principalTable: "units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_product_unit_conversions_AlternativeUnitId",
                schema: "base",
                table: "product_unit_conversions",
                column: "AlternativeUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_product_unit_conversions_ProductId_AlternativeUnitId",
                schema: "base",
                table: "product_unit_conversions",
                columns: new[] { "ProductId", "AlternativeUnitId" },
                unique: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_products_units_BaseUnitId",
                schema: "base",
                table: "products");

            migrationBuilder.DropTable(
                name: "product_unit_conversions",
                schema: "base");

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

            migrationBuilder.AddColumn<int>(
                name: "SecondaryUnitId",
                schema: "base",
                table: "products",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_products_SecondaryUnitId",
                schema: "base",
                table: "products",
                column: "SecondaryUnitId");

            migrationBuilder.AddForeignKey(
                name: "FK_products_units_SecondaryUnitId",
                schema: "base",
                table: "products",
                column: "SecondaryUnitId",
                principalSchema: "base",
                principalTable: "units",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

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
    }
}
