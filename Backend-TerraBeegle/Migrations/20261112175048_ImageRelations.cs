using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class ImageRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Images_LogoId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_game_artworks_Games_Game1Id",
                table: "game_artworks");

            migrationBuilder.DropForeignKey(
                name: "FK_game_screenshots_Games_Game2Id",
                table: "game_screenshots");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Games_Game1Id",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Games_SeriesId",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Games_CoverId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_Images_LogoId",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_Images_CoverId",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "DogCompanion",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "GameId",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "PegiRatingDescription",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "Website",
                table: "Games");

            migrationBuilder.RenameColumn(
                name: "LogoId",
                table: "Platforms",
                newName: "PlatformLogoId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_LogoId",
                table: "Platforms",
                newName: "IX_Platforms_PlatformLogoId");

            migrationBuilder.RenameColumn(
                name: "Game1Id",
                table: "game_series",
                newName: "GamesId");

            migrationBuilder.RenameColumn(
                name: "Game2Id",
                table: "game_screenshots",
                newName: "GamesAsScreenshotId");

            migrationBuilder.RenameColumn(
                name: "Game1Id",
                table: "game_artworks",
                newName: "GamesAsArtworkId");

            migrationBuilder.RenameIndex(
                name: "IX_game_artworks_Game1Id",
                table: "game_artworks",
                newName: "IX_game_artworks_GamesAsArtworkId");

            migrationBuilder.RenameColumn(
                name: "LogoId",
                table: "Companies",
                newName: "CompanyLogoId");

            migrationBuilder.RenameIndex(
                name: "IX_Companies_LogoId",
                table: "Companies",
                newName: "IX_Companies_CompanyLogoId");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Themes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Themes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Platforms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Platforms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "PlatformFamilies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "PlatformFamilies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "LoginChallenges",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "LoginChallenges",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Images",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Images",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Genres",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Genres",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<long>(
                name: "CoverId",
                table: "Games",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "VersionParentId",
                table: "Games",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Franchise",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiFranchiseId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Franchise", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "game_expanded_games",
                columns: table => new
                {
                    ExpandedGamesId = table.Column<long>(type: "bigint", nullable: false),
                    Game1Id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_expanded_games", x => new { x.ExpandedGamesId, x.Game1Id });
                    table.ForeignKey(
                        name: "FK_game_expanded_games_Games_ExpandedGamesId",
                        column: x => x.ExpandedGamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_expanded_games_Games_Game1Id",
                        column: x => x.Game1Id,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_expansions",
                columns: table => new
                {
                    ExpansionsId = table.Column<long>(type: "bigint", nullable: false),
                    Game2Id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_expansions", x => new { x.ExpansionsId, x.Game2Id });
                    table.ForeignKey(
                        name: "FK_game_expansions_Games_ExpansionsId",
                        column: x => x.ExpansionsId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_expansions_Games_Game2Id",
                        column: x => x.Game2Id,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Keywords",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiKeywordId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Keywords", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PegiDescription",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PegiDescription", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Serie",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiSerieId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Slug = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Serie", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Video",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiVideoId = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    GameId = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Video", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Video_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FranchiseGame",
                columns: table => new
                {
                    FranchisesId = table.Column<long>(type: "bigint", nullable: false),
                    GamesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FranchiseGame", x => new { x.FranchisesId, x.GamesId });
                    table.ForeignKey(
                        name: "FK_FranchiseGame_Franchise_FranchisesId",
                        column: x => x.FranchisesId,
                        principalTable: "Franchise",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FranchiseGame_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_keywords",
                columns: table => new
                {
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    KeywordsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_keywords", x => new { x.GamesId, x.KeywordsId });
                    table.ForeignKey(
                        name: "FK_game_keywords_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_keywords_Keywords_KeywordsId",
                        column: x => x.KeywordsId,
                        principalTable: "Keywords",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GamePegiDescription",
                columns: table => new
                {
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    PegiDescriptionsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GamePegiDescription", x => new { x.GamesId, x.PegiDescriptionsId });
                    table.ForeignKey(
                        name: "FK_GamePegiDescription_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GamePegiDescription_PegiDescription_PegiDescriptionsId",
                        column: x => x.PegiDescriptionsId,
                        principalTable: "PegiDescription",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Games_CoverId",
                table: "Games",
                column: "CoverId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Games_VersionParentId",
                table: "Games",
                column: "VersionParentId");

            migrationBuilder.CreateIndex(
                name: "IX_FranchiseGame_GamesId",
                table: "FranchiseGame",
                column: "GamesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_expanded_games_Game1Id",
                table: "game_expanded_games",
                column: "Game1Id");

            migrationBuilder.CreateIndex(
                name: "IX_game_expansions_Game2Id",
                table: "game_expansions",
                column: "Game2Id");

            migrationBuilder.CreateIndex(
                name: "IX_game_keywords_KeywordsId",
                table: "game_keywords",
                column: "KeywordsId");

            migrationBuilder.CreateIndex(
                name: "IX_GamePegiDescription_PegiDescriptionsId",
                table: "GamePegiDescription",
                column: "PegiDescriptionsId");

            migrationBuilder.CreateIndex(
                name: "IX_Keywords_ApiKeywordId",
                table: "Keywords",
                column: "ApiKeywordId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Keywords_Name",
                table: "Keywords",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Keywords_Slug",
                table: "Keywords",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Video_ApiVideoId",
                table: "Video",
                column: "ApiVideoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Video_GameId",
                table: "Video",
                column: "GameId");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Images_CompanyLogoId",
                table: "Companies",
                column: "CompanyLogoId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_game_artworks_Games_GamesAsArtworkId",
                table: "game_artworks",
                column: "GamesAsArtworkId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_screenshots_Games_GamesAsScreenshotId",
                table: "game_screenshots",
                column: "GamesAsScreenshotId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_series_Games_GamesId",
                table: "game_series",
                column: "GamesId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_series_Serie_SeriesId",
                table: "game_series",
                column: "SeriesId",
                principalTable: "Serie",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Games_Games_VersionParentId",
                table: "Games",
                column: "VersionParentId",
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
                name: "FK_Platforms_Images_PlatformLogoId",
                table: "Platforms",
                column: "PlatformLogoId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Images_CompanyLogoId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_game_artworks_Games_GamesAsArtworkId",
                table: "game_artworks");

            migrationBuilder.DropForeignKey(
                name: "FK_game_screenshots_Games_GamesAsScreenshotId",
                table: "game_screenshots");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Games_GamesId",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Serie_SeriesId",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_Games_Games_VersionParentId",
                table: "Games");

            migrationBuilder.DropForeignKey(
                name: "FK_Games_Images_CoverId",
                table: "Games");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_Images_PlatformLogoId",
                table: "Platforms");

            migrationBuilder.DropTable(
                name: "FranchiseGame");

            migrationBuilder.DropTable(
                name: "game_expanded_games");

            migrationBuilder.DropTable(
                name: "game_expansions");

            migrationBuilder.DropTable(
                name: "game_keywords");

            migrationBuilder.DropTable(
                name: "GamePegiDescription");

            migrationBuilder.DropTable(
                name: "Serie");

            migrationBuilder.DropTable(
                name: "Video");

            migrationBuilder.DropTable(
                name: "Franchise");

            migrationBuilder.DropTable(
                name: "Keywords");

            migrationBuilder.DropTable(
                name: "PegiDescription");

            migrationBuilder.DropIndex(
                name: "IX_Games_CoverId",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Games_VersionParentId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Themes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Themes");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "PlatformFamilies");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "PlatformFamilies");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "LoginChallenges");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "LoginChallenges");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Genres");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Genres");

            migrationBuilder.DropColumn(
                name: "CoverId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "VersionParentId",
                table: "Games");

            migrationBuilder.RenameColumn(
                name: "PlatformLogoId",
                table: "Platforms",
                newName: "LogoId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_PlatformLogoId",
                table: "Platforms",
                newName: "IX_Platforms_LogoId");

            migrationBuilder.RenameColumn(
                name: "GamesId",
                table: "game_series",
                newName: "Game1Id");

            migrationBuilder.RenameColumn(
                name: "GamesAsScreenshotId",
                table: "game_screenshots",
                newName: "Game2Id");

            migrationBuilder.RenameColumn(
                name: "GamesAsArtworkId",
                table: "game_artworks",
                newName: "Game1Id");

            migrationBuilder.RenameIndex(
                name: "IX_game_artworks_GamesAsArtworkId",
                table: "game_artworks",
                newName: "IX_game_artworks_Game1Id");

            migrationBuilder.RenameColumn(
                name: "CompanyLogoId",
                table: "Companies",
                newName: "LogoId");

            migrationBuilder.RenameIndex(
                name: "IX_Companies_CompanyLogoId",
                table: "Companies",
                newName: "IX_Companies_LogoId");

            migrationBuilder.AddColumn<string>(
                name: "DogCompanion",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "Beagle");

            migrationBuilder.AddColumn<long>(
                name: "GameId",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PegiRatingDescription",
                table: "Games",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Website",
                table: "Games",
                type: "text",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Images_CoverId",
                table: "Images",
                column: "CoverId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Images_LogoId",
                table: "Companies",
                column: "LogoId",
                principalTable: "Images",
                principalColumn: "Id");

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
        }
    }
}
