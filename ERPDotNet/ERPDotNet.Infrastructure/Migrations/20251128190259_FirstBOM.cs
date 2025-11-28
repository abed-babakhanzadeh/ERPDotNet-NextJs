using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERPDotNet.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FirstBOM : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bom_details_products_ChildProductId",
                schema: "engineering",
                table: "bom_details");

            migrationBuilder.DropForeignKey(
                name: "FK_bom_headers_products_ProductId",
                schema: "engineering",
                table: "bom_headers");

            migrationBuilder.DropForeignKey(
                name: "FK_bom_substitutes_products_SubstituteProductId",
                schema: "engineering",
                table: "bom_substitutes");

            migrationBuilder.DropIndex(
                name: "IX_bom_substitutes_BOMDetailId",
                schema: "engineering",
                table: "bom_substitutes");

            migrationBuilder.DropIndex(
                name: "IX_bom_headers_ProductId",
                schema: "engineering",
                table: "bom_headers");

            migrationBuilder.DropIndex(
                name: "IX_bom_details_BOMHeaderId",
                schema: "engineering",
                table: "bom_details");

            migrationBuilder.EnsureSchema(
                name: "eng");

            migrationBuilder.RenameTable(
                name: "bom_substitutes",
                schema: "engineering",
                newName: "bom_substitutes",
                newSchema: "eng");

            migrationBuilder.RenameTable(
                name: "bom_headers",
                schema: "engineering",
                newName: "bom_headers",
                newSchema: "eng");

            migrationBuilder.RenameTable(
                name: "bom_details",
                schema: "engineering",
                newName: "bom_details",
                newSchema: "eng");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                schema: "eng",
                table: "bom_headers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(200)",
                oldMaxLength: 200);

            migrationBuilder.CreateIndex(
                name: "IX_bom_substitutes_BOMDetailId_SubstituteProductId",
                schema: "eng",
                table: "bom_substitutes",
                columns: new[] { "BOMDetailId", "SubstituteProductId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_bom_headers_ProductId_Version",
                schema: "eng",
                table: "bom_headers",
                columns: new[] { "ProductId", "Version" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_bom_details_BOMHeaderId_ChildProductId",
                schema: "eng",
                table: "bom_details",
                columns: new[] { "BOMHeaderId", "ChildProductId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_bom_details_products_ChildProductId",
                schema: "eng",
                table: "bom_details",
                column: "ChildProductId",
                principalSchema: "base",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_bom_headers_products_ProductId",
                schema: "eng",
                table: "bom_headers",
                column: "ProductId",
                principalSchema: "base",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_bom_substitutes_products_SubstituteProductId",
                schema: "eng",
                table: "bom_substitutes",
                column: "SubstituteProductId",
                principalSchema: "base",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_bom_details_products_ChildProductId",
                schema: "eng",
                table: "bom_details");

            migrationBuilder.DropForeignKey(
                name: "FK_bom_headers_products_ProductId",
                schema: "eng",
                table: "bom_headers");

            migrationBuilder.DropForeignKey(
                name: "FK_bom_substitutes_products_SubstituteProductId",
                schema: "eng",
                table: "bom_substitutes");

            migrationBuilder.DropIndex(
                name: "IX_bom_substitutes_BOMDetailId_SubstituteProductId",
                schema: "eng",
                table: "bom_substitutes");

            migrationBuilder.DropIndex(
                name: "IX_bom_headers_ProductId_Version",
                schema: "eng",
                table: "bom_headers");

            migrationBuilder.DropIndex(
                name: "IX_bom_details_BOMHeaderId_ChildProductId",
                schema: "eng",
                table: "bom_details");

            migrationBuilder.EnsureSchema(
                name: "engineering");

            migrationBuilder.RenameTable(
                name: "bom_substitutes",
                schema: "eng",
                newName: "bom_substitutes",
                newSchema: "engineering");

            migrationBuilder.RenameTable(
                name: "bom_headers",
                schema: "eng",
                newName: "bom_headers",
                newSchema: "engineering");

            migrationBuilder.RenameTable(
                name: "bom_details",
                schema: "eng",
                newName: "bom_details",
                newSchema: "engineering");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                schema: "engineering",
                table: "bom_headers",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.CreateIndex(
                name: "IX_bom_substitutes_BOMDetailId",
                schema: "engineering",
                table: "bom_substitutes",
                column: "BOMDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_bom_headers_ProductId",
                schema: "engineering",
                table: "bom_headers",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_bom_details_BOMHeaderId",
                schema: "engineering",
                table: "bom_details",
                column: "BOMHeaderId");

            migrationBuilder.AddForeignKey(
                name: "FK_bom_details_products_ChildProductId",
                schema: "engineering",
                table: "bom_details",
                column: "ChildProductId",
                principalSchema: "base",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_bom_headers_products_ProductId",
                schema: "engineering",
                table: "bom_headers",
                column: "ProductId",
                principalSchema: "base",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_bom_substitutes_products_SubstituteProductId",
                schema: "engineering",
                table: "bom_substitutes",
                column: "SubstituteProductId",
                principalSchema: "base",
                principalTable: "products",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
