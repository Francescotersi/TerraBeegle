using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class AddedIndexGameType : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamilyId",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews");

            migrationBuilder.RenameColumn(
                name: "GameId",
                table: "Reviews",
                newName: "ApiGameId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_GameId_UserId",
                table: "Reviews",
                newName: "IX_Reviews_ApiGameId_UserId");

            migrationBuilder.RenameColumn(
                name: "PlatformFamilyId",
                table: "Platforms",
                newName: "ApiPlatformFamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_PlatformFamilyId",
                table: "Platforms",
                newName: "IX_Platforms_ApiPlatformFamilyId");

            migrationBuilder.CreateIndex(
                name: "IX_Games_GameType",
                table: "Games",
                column: "GameType");

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_PlatformFamilies_ApiPlatformFamilyId",
                table: "Platforms",
                column: "ApiPlatformFamilyId",
                principalTable: "PlatformFamilies",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Games_ApiGameId",
                table: "Reviews",
                column: "ApiGameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_PlatformFamilies_ApiPlatformFamilyId",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_ApiGameId",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Games_GameType",
                table: "Games");

            migrationBuilder.RenameColumn(
                name: "ApiGameId",
                table: "Reviews",
                newName: "GameId");

            migrationBuilder.RenameIndex(
                name: "IX_Reviews_ApiGameId_UserId",
                table: "Reviews",
                newName: "IX_Reviews_GameId_UserId");

            migrationBuilder.RenameColumn(
                name: "ApiPlatformFamilyId",
                table: "Platforms",
                newName: "PlatformFamilyId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_ApiPlatformFamilyId",
                table: "Platforms",
                newName: "IX_Platforms_PlatformFamilyId");

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamilyId",
                table: "Platforms",
                column: "PlatformFamilyId",
                principalTable: "PlatformFamilies",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
