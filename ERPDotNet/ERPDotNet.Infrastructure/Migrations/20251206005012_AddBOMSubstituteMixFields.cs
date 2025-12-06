using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBOMSubstituteMixFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsMixAllowed",
                schema: "eng",
                table: "bom_substitutes",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "MaxMixPercentage",
                schema: "eng",
                table: "bom_substitutes",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                schema: "eng",
                table: "bom_substitutes",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsMixAllowed",
                schema: "eng",
                table: "bom_substitutes");

            migrationBuilder.DropColumn(
                name: "MaxMixPercentage",
                schema: "eng",
                table: "bom_substitutes");

            migrationBuilder.DropColumn(
                name: "Note",
                schema: "eng",
                table: "bom_substitutes");
        }
    }
}
