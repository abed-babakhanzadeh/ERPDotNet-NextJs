using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBOMModule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "engineering");

            migrationBuilder.CreateTable(
                name: "bom_headers",
                schema: "engineering",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ProductId = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Version = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    FromDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ToDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bom_headers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_bom_headers_products_ProductId",
                        column: x => x.ProductId,
                        principalSchema: "base",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bom_details",
                schema: "engineering",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BOMHeaderId = table.Column<int>(type: "integer", nullable: false),
                    ChildProductId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    WastePercentage = table.Column<decimal>(type: "numeric(5,2)", precision: 5, scale: 2, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bom_details", x => x.Id);
                    table.ForeignKey(
                        name: "FK_bom_details_bom_headers_BOMHeaderId",
                        column: x => x.BOMHeaderId,
                        principalSchema: "engineering",
                        principalTable: "bom_headers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_bom_details_products_ChildProductId",
                        column: x => x.ChildProductId,
                        principalSchema: "base",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "bom_substitutes",
                schema: "engineering",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    BOMDetailId = table.Column<int>(type: "integer", nullable: false),
                    SubstituteProductId = table.Column<int>(type: "integer", nullable: false),
                    Priority = table.Column<int>(type: "integer", nullable: false),
                    Factor = table.Column<decimal>(type: "numeric(18,6)", precision: 18, scale: 6, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_bom_substitutes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_bom_substitutes_bom_details_BOMDetailId",
                        column: x => x.BOMDetailId,
                        principalSchema: "engineering",
                        principalTable: "bom_details",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_bom_substitutes_products_SubstituteProductId",
                        column: x => x.SubstituteProductId,
                        principalSchema: "base",
                        principalTable: "products",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_bom_details_BOMHeaderId",
                schema: "engineering",
                table: "bom_details",
                column: "BOMHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_bom_details_ChildProductId",
                schema: "engineering",
                table: "bom_details",
                column: "ChildProductId");

            migrationBuilder.CreateIndex(
                name: "IX_bom_headers_ProductId",
                schema: "engineering",
                table: "bom_headers",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_bom_substitutes_BOMDetailId",
                schema: "engineering",
                table: "bom_substitutes",
                column: "BOMDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_bom_substitutes_SubstituteProductId",
                schema: "engineering",
                table: "bom_substitutes",
                column: "SubstituteProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "bom_substitutes",
                schema: "engineering");

            migrationBuilder.DropTable(
                name: "bom_details",
                schema: "engineering");

            migrationBuilder.DropTable(
                name: "bom_headers",
                schema: "engineering");
        }
    }
}
