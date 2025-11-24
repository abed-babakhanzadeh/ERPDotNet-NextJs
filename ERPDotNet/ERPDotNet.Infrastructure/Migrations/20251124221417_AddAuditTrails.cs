using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditTrails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "base",
                table: "units",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                schema: "base",
                table: "units",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "base",
                table: "products",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                schema: "base",
                table: "products",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "base",
                table: "product_unit_conversions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                schema: "base",
                table: "product_unit_conversions",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "engineering",
                table: "bom_substitutes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                schema: "engineering",
                table: "bom_substitutes",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "engineering",
                table: "bom_headers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                schema: "engineering",
                table: "bom_headers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedBy",
                schema: "engineering",
                table: "bom_details",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LastModifiedBy",
                schema: "engineering",
                table: "bom_details",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AuditTrails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    TableName = table.Column<string>(type: "text", nullable: false),
                    DateTime = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PrimaryKey = table.Column<string>(type: "text", nullable: true),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true),
                    AffectedColumns = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditTrails", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuditTrails");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "base",
                table: "units");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                schema: "base",
                table: "units");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "base",
                table: "products");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                schema: "base",
                table: "products");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "base",
                table: "product_unit_conversions");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                schema: "base",
                table: "product_unit_conversions");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "engineering",
                table: "bom_substitutes");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                schema: "engineering",
                table: "bom_substitutes");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "engineering",
                table: "bom_headers");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                schema: "engineering",
                table: "bom_headers");

            migrationBuilder.DropColumn(
                name: "CreatedBy",
                schema: "engineering",
                table: "bom_details");

            migrationBuilder.DropColumn(
                name: "LastModifiedBy",
                schema: "engineering",
                table: "bom_details");
        }
    }
}
