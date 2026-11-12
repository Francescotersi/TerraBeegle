using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class FixGameAndPlatformRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_game_artworks_Games_ArtworksOfGamesId",
                table: "game_artworks");

            migrationBuilder.DropForeignKey(
                name: "FK_game_screenshots_Games_ScreenshotsOfGamesId",
                table: "game_screenshots");

            migrationBuilder.DropForeignKey(
                name: "FK_Games_Images_CoverId",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_CoverId",
                table: "Games");

            migrationBuilder.DropPrimaryKey(
                name: "PK_game_screenshots",
                table: "game_screenshots");

            migrationBuilder.DropIndex(
                name: "IX_game_screenshots_ScreenshotsOfGamesId",
                table: "game_screenshots");

            migrationBuilder.DropIndex(
                name: "IX_Companies_LogoId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "CoverId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Country",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "Companies");

            migrationBuilder.RenameColumn(
                name: "ScreenshotsOfGamesId",
                table: "game_screenshots",
                newName: "Game2Id");

            migrationBuilder.RenameColumn(
                name: "ArtworksOfGamesId",
                table: "game_artworks",
                newName: "Game1Id");

            migrationBuilder.RenameIndex(
                name: "IX_game_artworks_ArtworksOfGamesId",
                table: "game_artworks",
                newName: "IX_game_artworks_Game1Id");

            migrationBuilder.AddColumn<long>(
                name: "LogoId",
                table: "Platforms",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "CoverId",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "ApiCompanyId",
                table: "Companies",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddPrimaryKey(
                name: "PK_game_screenshots",
                table: "game_screenshots",
                columns: new[] { "Game2Id", "ScreenshotsId" });

            migrationBuilder.CreateTable(
                name: "PlatformFamilies",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiPlatformFamilyId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlatformFamilies", x => x.Id);
                    table.UniqueConstraint("AK_PlatformFamilies_ApiPlatformFamilyId", x => x.ApiPlatformFamilyId);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_LogoId",
                table: "Platforms",
                column: "LogoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_PlatformFamily",
                table: "Platforms",
                column: "PlatformFamily");

            migrationBuilder.CreateIndex(
                name: "IX_Images_CoverId",
                table: "Images",
                column: "CoverId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_game_screenshots_ScreenshotsId",
                table: "game_screenshots",
                column: "ScreenshotsId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_LogoId",
                table: "Companies",
                column: "LogoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlatformFamilies_ApiPlatformFamilyId",
                table: "PlatformFamilies",
                column: "ApiPlatformFamilyId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PlatformFamilies_Slug",
                table: "PlatformFamilies",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_game_artworks_Games_Game1Id",
                table: "game_artworks",
                column: "Game1Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_screenshots_Games_Game2Id",
                table: "game_screenshots",
                column: "Game2Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Games_CoverId",
                table: "Images",
                column: "CoverId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_Images_LogoId",
                table: "Platforms",
                column: "LogoId",
                principalTable: "Images",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamily",
                table: "Platforms",
                column: "PlatformFamily",
                principalTable: "PlatformFamilies",
                principalColumn: "ApiPlatformFamilyId",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_game_artworks_Games_Game1Id",
                table: "game_artworks");

            migrationBuilder.DropForeignKey(
                name: "FK_game_screenshots_Games_Game2Id",
                table: "game_screenshots");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Games_CoverId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_Images_LogoId",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamily",
                table: "Platforms");

            migrationBuilder.DropTable(
                name: "PlatformFamilies");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_LogoId",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_PlatformFamily",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_Images_CoverId",
                table: "Images");

            migrationBuilder.DropPrimaryKey(
                name: "PK_game_screenshots",
                table: "game_screenshots");

            migrationBuilder.DropIndex(
                name: "IX_game_screenshots_ScreenshotsId",
                table: "game_screenshots");

            migrationBuilder.DropIndex(
                name: "IX_Companies_LogoId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "LogoId",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "CoverId",
                table: "Images");

            migrationBuilder.RenameColumn(
                name: "Game2Id",
                table: "game_screenshots",
                newName: "ScreenshotsOfGamesId");

            migrationBuilder.RenameColumn(
                name: "Game1Id",
                table: "game_artworks",
                newName: "ArtworksOfGamesId");

            migrationBuilder.RenameIndex(
                name: "IX_game_artworks_Game1Id",
                table: "game_artworks",
                newName: "IX_game_artworks_ArtworksOfGamesId");

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Images",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "CoverId",
                table: "Games",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<int>(
                name: "ApiCompanyId",
                table: "Companies",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<string>(
                name: "Country",
                table: "Companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "Companies",
                type: "text",
                nullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "PK_game_screenshots",
                table: "game_screenshots",
                columns: new[] { "ScreenshotsId", "ScreenshotsOfGamesId" });

            migrationBuilder.CreateIndex(
                name: "IX_Games_CoverId",
                table: "Games",
                column: "CoverId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_game_screenshots_ScreenshotsOfGamesId",
                table: "game_screenshots",
                column: "ScreenshotsOfGamesId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_LogoId",
                table: "Companies",
                column: "LogoId");

            migrationBuilder.AddForeignKey(
                name: "FK_game_artworks_Games_ArtworksOfGamesId",
                table: "game_artworks",
                column: "ArtworksOfGamesId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_screenshots_Games_ScreenshotsOfGamesId",
                table: "game_screenshots",
                column: "ScreenshotsOfGamesId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Games_Images_CoverId",
                table: "Games",
                column: "CoverId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
