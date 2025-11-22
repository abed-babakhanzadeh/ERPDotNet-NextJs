using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddProductEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "products",
                schema: "base",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    TechnicalSpec = table.Column<string>(type: "text", nullable: true),
                    UnitId = table.Column<int>(type: "integer", nullable: false),
                    SecondaryUnitId = table.Column<int>(type: "integer", nullable: true),
                    SupplyType = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_products", x => x.Id);
                    table.ForeignKey(
                        name: "FK_products_units_SecondaryUnitId",
                        column: x => x.SecondaryUnitId,
                        principalSchema: "base",
                        principalTable: "units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_products_units_UnitId",
                        column: x => x.UnitId,
                        principalSchema: "base",
                        principalTable: "units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_products_Code",
                schema: "base",
                table: "products",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_products_SecondaryUnitId",
                schema: "base",
                table: "products",
                column: "SecondaryUnitId");

            migrationBuilder.CreateIndex(
                name: "IX_products_UnitId",
                schema: "base",
                table: "products",
                column: "UnitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "products",
                schema: "base");
        }
    }
}
