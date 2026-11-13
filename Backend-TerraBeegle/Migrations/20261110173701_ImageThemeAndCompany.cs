using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class ImageThemeAndCompany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Games_GameId",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginChallenges_Users_UserId",
                table: "LoginChallenges");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_ParentPlatforms_ParentPlatformId",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews");

            migrationBuilder.DropTable(
                name: "game_parent_games");

            migrationBuilder.DropTable(
                name: "game_parent_platforms");

            migrationBuilder.DropTable(
                name: "ParentPlatforms");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_ParentPlatformId",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_LoginChallenges_UserId",
                table: "LoginChallenges");

            migrationBuilder.DropIndex(
                name: "IX_Genres_Name",
                table: "Genres");

            migrationBuilder.DropIndex(
                name: "IX_Games_RawgGameId",
                table: "Games");

            migrationBuilder.DropPrimaryKey(
                name: "PK_game_series",
                table: "game_series");

            migrationBuilder.DropPrimaryKey(
                name: "PK_game_dlcs",
                table: "game_dlcs");

            migrationBuilder.DropColumn(
                name: "ParentPlatformId",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "BackgroundImage",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Developer",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Metacritic",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Publisher",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Rating1count",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "RawgGameId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Tba",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "game_series");

            migrationBuilder.DropColumn(
                name: "RawgId",
                table: "game_series");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "game_series");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "game_dlcs");

            migrationBuilder.DropColumn(
                name: "RawgId",
                table: "game_dlcs");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "game_dlcs");

            migrationBuilder.RenameColumn(
                name: "RawgPlatformId",
                table: "Platforms",
                newName: "ApiPlatformId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_RawgPlatformId",
                table: "Platforms",
                newName: "IX_Platforms_ApiPlatformId");

            migrationBuilder.RenameColumn(
                name: "RawgGenreId",
                table: "Genres",
                newName: "ApiGenreId");

            migrationBuilder.RenameIndex(
                name: "IX_Genres_RawgGenreId",
                table: "Genres",
                newName: "IX_Genres_ApiGenreId");

            migrationBuilder.RenameColumn(
                name: "RatingCount",
                table: "Games",
                newName: "ParentGameId");

            migrationBuilder.RenameColumn(
                name: "Rating5count",
                table: "Games",
                newName: "PegiRating");

            migrationBuilder.RenameColumn(
                name: "Rating4count",
                table: "Games",
                newName: "GameType");

            migrationBuilder.RenameColumn(
                name: "Rating3count",
                table: "Games",
                newName: "GameStatus");

            migrationBuilder.RenameColumn(
                name: "Rating2count",
                table: "Games",
                newName: "AggregatedRating");

            migrationBuilder.RenameColumn(
                name: "NameOriginal",
                table: "Games",
                newName: "Storyline");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "Games",
                newName: "Summary");

            migrationBuilder.RenameColumn(
                name: "GameId",
                table: "game_series",
                newName: "SeriesId");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "game_series",
                newName: "Game1Id");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "game_dlcs",
                newName: "DLCsId");

            migrationBuilder.AddColumn<string>(
                name: "Abbreviation",
                table: "Platforms",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "PlatformFamily",
                table: "Platforms",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Platforms",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "Genres",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<long>(
                name: "ApiGameId",
                table: "Games",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "CoverId",
                table: "Games",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<string>(
                name: "PegiRatingDescription",
                table: "Games",
                type: "text",
                nullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Game1Id",
                table: "game_series",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AlterColumn<long>(
                name: "DLCsId",
                table: "game_dlcs",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .OldAnnotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddPrimaryKey(
                name: "PK_game_series",
                table: "game_series",
                columns: new[] { "Game1Id", "SeriesId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_game_dlcs",
                table: "game_dlcs",
                columns: new[] { "DLCsId", "GameId" });

            migrationBuilder.CreateTable(
                name: "Images",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiImageId = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: true),
                    GameId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Images", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Themes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiThemeId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Themes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Companies",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiCompanyId = table.Column<int>(type: "integer", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Slug = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    LogoId = table.Column<long>(type: "bigint", nullable: true),
                    Country = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Companies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Companies_Images_LogoId",
                        column: x => x.LogoId,
                        principalTable: "Images",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "game_artworks",
                columns: table => new
                {
                    ArtworksId = table.Column<long>(type: "bigint", nullable: false),
                    ArtworksOfGamesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_artworks", x => new { x.ArtworksId, x.ArtworksOfGamesId });
                    table.ForeignKey(
                        name: "FK_game_artworks_Games_ArtworksOfGamesId",
                        column: x => x.ArtworksOfGamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_artworks_Images_ArtworksId",
                        column: x => x.ArtworksId,
                        principalTable: "Images",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_screenshots",
                columns: table => new
                {
                    ScreenshotsId = table.Column<long>(type: "bigint", nullable: false),
                    ScreenshotsOfGamesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_screenshots", x => new { x.ScreenshotsId, x.ScreenshotsOfGamesId });
                    table.ForeignKey(
                        name: "FK_game_screenshots_Games_ScreenshotsOfGamesId",
                        column: x => x.ScreenshotsOfGamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_screenshots_Images_ScreenshotsId",
                        column: x => x.ScreenshotsId,
                        principalTable: "Images",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_themes",
                columns: table => new
                {
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    ThemesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_themes", x => new { x.GamesId, x.ThemesId });
                    table.ForeignKey(
                        name: "FK_game_themes_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_themes_Themes_ThemesId",
                        column: x => x.ThemesId,
                        principalTable: "Themes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_developers",
                columns: table => new
                {
                    DevelopedGamesId = table.Column<long>(type: "bigint", nullable: false),
                    DevelopersId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_developers", x => new { x.DevelopedGamesId, x.DevelopersId });
                    table.ForeignKey(
                        name: "FK_game_developers_Companies_DevelopersId",
                        column: x => x.DevelopersId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_developers_Games_DevelopedGamesId",
                        column: x => x.DevelopedGamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_publishers",
                columns: table => new
                {
                    PublishedGamesId = table.Column<long>(type: "bigint", nullable: false),
                    PublishersId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_publishers", x => new { x.PublishedGamesId, x.PublishersId });
                    table.ForeignKey(
                        name: "FK_game_publishers_Companies_PublishersId",
                        column: x => x.PublishersId,
                        principalTable: "Companies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_publishers_Games_PublishedGamesId",
                        column: x => x.PublishedGamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_Name",
                table: "Platforms",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_Slug",
                table: "Platforms",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LoginChallenges_UserId",
                table: "LoginChallenges",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Genres_Name",
                table: "Genres",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Genres_Slug",
                table: "Genres",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Games_ApiGameId",
                table: "Games",
                column: "ApiGameId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Games_CoverId",
                table: "Games",
                column: "CoverId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Games_ParentGameId",
                table: "Games",
                column: "ParentGameId");

            migrationBuilder.CreateIndex(
                name: "IX_game_series_SeriesId",
                table: "game_series",
                column: "SeriesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_dlcs_GameId",
                table: "game_dlcs",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_ApiCompanyId",
                table: "Companies",
                column: "ApiCompanyId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_LogoId",
                table: "Companies",
                column: "LogoId");

            migrationBuilder.CreateIndex(
                name: "IX_Companies_Slug",
                table: "Companies",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_game_artworks_ArtworksOfGamesId",
                table: "game_artworks",
                column: "ArtworksOfGamesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_developers_DevelopersId",
                table: "game_developers",
                column: "DevelopersId");

            migrationBuilder.CreateIndex(
                name: "IX_game_publishers_PublishersId",
                table: "game_publishers",
                column: "PublishersId");

            migrationBuilder.CreateIndex(
                name: "IX_game_screenshots_ScreenshotsOfGamesId",
                table: "game_screenshots",
                column: "ScreenshotsOfGamesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_themes_ThemesId",
                table: "game_themes",
                column: "ThemesId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_ApiImageId",
                table: "Images",
                column: "ApiImageId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Themes_ApiThemeId",
                table: "Themes",
                column: "ApiThemeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Themes_Name",
                table: "Themes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Themes_Slug",
                table: "Themes",
                column: "Slug",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships",
                column: "User1Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_game_dlcs_Games_DLCsId",
                table: "game_dlcs",
                column: "DLCsId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_series_Games_Game1Id",
                table: "game_series",
                column: "Game1Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_series_Games_SeriesId",
                table: "game_series",
                column: "SeriesId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Games_Games_ParentGameId",
                table: "Games",
                column: "ParentGameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Games_Images_CoverId",
                table: "Games",
                column: "CoverId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_LoginChallenges_Users_UserId",
                table: "LoginChallenges",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_game_dlcs_Games_DLCsId",
                table: "game_dlcs");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Games_Game1Id",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Games_SeriesId",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_Games_Games_ParentGameId",
                table: "Games");

            migrationBuilder.DropForeignKey(
                name: "FK_Games_Images_CoverId",
                table: "Games");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginChallenges_Users_UserId",
                table: "LoginChallenges");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews");

            migrationBuilder.DropTable(
                name: "game_artworks");

            migrationBuilder.DropTable(
                name: "game_developers");

            migrationBuilder.DropTable(
                name: "game_publishers");

            migrationBuilder.DropTable(
                name: "game_screenshots");

            migrationBuilder.DropTable(
                name: "game_themes");

            migrationBuilder.DropTable(
                name: "Companies");

            migrationBuilder.DropTable(
                name: "Themes");

            migrationBuilder.DropTable(
                name: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_Name",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_Slug",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_LoginChallenges_UserId",
                table: "LoginChallenges");

            migrationBuilder.DropIndex(
                name: "IX_Genres_Name",
                table: "Genres");

            migrationBuilder.DropIndex(
                name: "IX_Genres_Slug",
                table: "Genres");

            migrationBuilder.DropIndex(
                name: "IX_Games_ApiGameId",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_CoverId",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_ParentGameId",
                table: "Games");

            migrationBuilder.DropPrimaryKey(
                name: "PK_game_series",
                table: "game_series");

            migrationBuilder.DropIndex(
                name: "IX_game_series_SeriesId",
                table: "game_series");

            migrationBuilder.DropPrimaryKey(
                name: "PK_game_dlcs",
                table: "game_dlcs");

            migrationBuilder.DropIndex(
                name: "IX_game_dlcs_GameId",
                table: "game_dlcs");

            migrationBuilder.DropColumn(
                name: "Abbreviation",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "PlatformFamily",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "Genres");

            migrationBuilder.DropColumn(
                name: "ApiGameId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "CoverId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "PegiRatingDescription",
                table: "Games");

            migrationBuilder.RenameColumn(
                name: "ApiPlatformId",
                table: "Platforms",
                newName: "RawgPlatformId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_ApiPlatformId",
                table: "Platforms",
                newName: "IX_Platforms_RawgPlatformId");

            migrationBuilder.RenameColumn(
                name: "ApiGenreId",
                table: "Genres",
                newName: "RawgGenreId");

            migrationBuilder.RenameIndex(
                name: "IX_Genres_ApiGenreId",
                table: "Genres",
                newName: "IX_Genres_RawgGenreId");

            migrationBuilder.RenameColumn(
                name: "Summary",
                table: "Games",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "Storyline",
                table: "Games",
                newName: "NameOriginal");

            migrationBuilder.RenameColumn(
                name: "PegiRating",
                table: "Games",
                newName: "Rating5count");

            migrationBuilder.RenameColumn(
                name: "ParentGameId",
                table: "Games",
                newName: "RatingCount");

            migrationBuilder.RenameColumn(
                name: "GameType",
                table: "Games",
                newName: "Rating4count");

            migrationBuilder.RenameColumn(
                name: "GameStatus",
                table: "Games",
                newName: "Rating3count");

            migrationBuilder.RenameColumn(
                name: "AggregatedRating",
                table: "Games",
                newName: "Rating2count");

            migrationBuilder.RenameColumn(
                name: "SeriesId",
                table: "game_series",
                newName: "GameId");

            migrationBuilder.RenameColumn(
                name: "Game1Id",
                table: "game_series",
                newName: "Id");

            migrationBuilder.RenameColumn(
                name: "DLCsId",
                table: "game_dlcs",
                newName: "Id");

            migrationBuilder.AddColumn<long>(
                name: "ParentPlatformId",
                table: "Platforms",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BackgroundImage",
                table: "Games",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Developer",
                table: "Games",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Metacritic",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Publisher",
                table: "Games",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating1count",
                table: "Games",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RawgGameId",
                table: "Games",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "Tba",
                table: "Games",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "game_series",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "game_series",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "RawgId",
                table: "game_series",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "game_series",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "game_dlcs",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "game_dlcs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "RawgId",
                table: "game_dlcs",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "game_dlcs",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_game_series",
                table: "game_series",
                columns: new[] { "GameId", "Id" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_game_dlcs",
                table: "game_dlcs",
                columns: new[] { "GameId", "Id" });

            migrationBuilder.CreateTable(
                name: "game_parent_games",
                columns: table => new
                {
                    GameId = table.Column<long>(type: "bigint", nullable: false),
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    RawgId = table.Column<int>(type: "integer", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_parent_games", x => new { x.GameId, x.Id });
                    table.ForeignKey(
                        name: "FK_game_parent_games_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ParentPlatforms",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Image = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    RawgPlatformId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ParentPlatforms", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "game_parent_platforms",
                columns: table => new
                {
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    ParentPlatformsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_parent_platforms", x => new { x.GamesId, x.ParentPlatformsId });
                    table.ForeignKey(
                        name: "FK_game_parent_platforms_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_parent_platforms_ParentPlatforms_ParentPlatformsId",
                        column: x => x.ParentPlatformsId,
                        principalTable: "ParentPlatforms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_ParentPlatformId",
                table: "Platforms",
                column: "ParentPlatformId");

            migrationBuilder.CreateIndex(
                name: "IX_LoginChallenges_UserId",
                table: "LoginChallenges",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Genres_Name",
                table: "Genres",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Games_RawgGameId",
                table: "Games",
                column: "RawgGameId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_game_parent_platforms_ParentPlatformsId",
                table: "game_parent_platforms",
                column: "ParentPlatformsId");

            migrationBuilder.CreateIndex(
                name: "IX_ParentPlatforms_RawgPlatformId",
                table: "ParentPlatforms",
                column: "RawgPlatformId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships",
                column: "User1Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships",
                column: "User2Id",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_series_Games_GameId",
                table: "game_series",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LoginChallenges_Users_UserId",
                table: "LoginChallenges",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_ParentPlatforms_ParentPlatformId",
                table: "Platforms",
                column: "ParentPlatformId",
                principalTable: "ParentPlatforms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
