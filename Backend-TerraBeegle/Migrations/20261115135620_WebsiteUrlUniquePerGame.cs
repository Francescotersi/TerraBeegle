using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class WebsiteUrlUniquePerGame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Websites_GameId_Type",
                table: "Websites");

            migrationBuilder.DropIndex(
                name: "IX_Websites_Url",
                table: "Websites");

            migrationBuilder.CreateIndex(
                name: "IX_Websites_GameId_Type",
                table: "Websites",
                columns: new[] { "GameId", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_Websites_GameId_Url",
                table: "Websites",
                columns: new[] { "GameId", "Url" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Websites_GameId_Type",
                table: "Websites");

            migrationBuilder.DropIndex(
                name: "IX_Websites_GameId_Url",
                table: "Websites");

            migrationBuilder.CreateIndex(
                name: "IX_Websites_GameId_Type",
                table: "Websites",
                columns: new[] { "GameId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Websites_Url",
                table: "Websites",
                column: "Url",
                unique: true);
        }
    }
}
