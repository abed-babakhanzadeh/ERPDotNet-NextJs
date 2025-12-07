using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class unitEdit1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "InputQuantity",
                schema: "eng",
                table: "bom_details",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "InputUnitId",
                schema: "eng",
                table: "bom_details",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "InputQuantity",
                schema: "eng",
                table: "bom_details");

            migrationBuilder.DropColumn(
                name: "InputUnitId",
                schema: "eng",
                table: "bom_details");
        }
    }
}
