using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBaseInfoModule_Final : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "base");

            migrationBuilder.CreateTable(
                name: "units",
                schema: "base",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Symbol = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Precision = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    BaseUnitId = table.Column<int>(type: "integer", nullable: true),
                    ConversionFactor = table.Column<decimal>(type: "numeric", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_units", x => x.Id);
                    table.ForeignKey(
                        name: "FK_units_units_BaseUnitId",
                        column: x => x.BaseUnitId,
                        principalSchema: "base",
                        principalTable: "units",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_units_BaseUnitId",
                schema: "base",
                table: "units",
                column: "BaseUnitId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "units",
                schema: "base");
        }
    }
}
