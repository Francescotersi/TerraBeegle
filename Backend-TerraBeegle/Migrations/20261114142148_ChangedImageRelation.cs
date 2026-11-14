using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class ChangedImageRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Companies_Images_CompanyLogoId",
                table: "Companies");

            migrationBuilder.DropForeignKey(
                name: "FK_FranchiseGame_Franchise_FranchisesId",
                table: "FranchiseGame");

            migrationBuilder.DropForeignKey(
                name: "FK_FranchiseGame_Games_GamesId",
                table: "FranchiseGame");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User1Id",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_Friendships_Users_User2Id",
                table: "Friendships");

            migrationBuilder.DropForeignKey(
                name: "FK_game_dlcs_Games_GameId",
                table: "game_dlcs");

            migrationBuilder.DropForeignKey(
                name: "FK_game_expanded_games_Games_Game1Id",
                table: "game_expanded_games");

            migrationBuilder.DropForeignKey(
                name: "FK_game_expansions_Games_Game2Id",
                table: "game_expansions");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Serie_SeriesId",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_GamePegiDescription_Games_GamesId",
                table: "GamePegiDescription");

            migrationBuilder.DropForeignKey(
                name: "FK_GamePegiDescription_PegiDescription_PegiDescriptionsId",
                table: "GamePegiDescription");

            migrationBuilder.DropForeignKey(
                name: "FK_Games_Images_CoverId",
                table: "Games");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginChallenges_Users_UserId",
                table: "LoginChallenges");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_Images_PlatformLogoId",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamily",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Video_Games_GameId",
                table: "Video");

            migrationBuilder.DropTable(
                name: "game_artworks");

            migrationBuilder.DropTable(
                name: "game_screenshots");

            migrationBuilder.DropIndex(
                name: "IX_Themes_Name",
                table: "Themes");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_Name",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_PlatformLogoId",
                table: "Platforms");

            migrationBuilder.DropUniqueConstraint(
                name: "AK_PlatformFamilies_ApiPlatformFamilyId",
                table: "PlatformFamilies");

            migrationBuilder.DropIndex(
                name: "IX_Games_CoverId",
                table: "Games");

            migrationBuilder.DropIndex(
                name: "IX_Companies_CompanyLogoId",
                table: "Companies");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Video",
                table: "Video");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Serie",
                table: "Serie");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PegiDescription",
                table: "PegiDescription");

            migrationBuilder.DropPrimaryKey(
                name: "PK_GamePegiDescription",
                table: "GamePegiDescription");

            migrationBuilder.DropPrimaryKey(
                name: "PK_FranchiseGame",
                table: "FranchiseGame");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Franchise",
                table: "Franchise");

            migrationBuilder.DropColumn(
                name: "CoverId",
                table: "Games");

            migrationBuilder.DropColumn(
                name: "CompanyLogoId",
                table: "Companies");

            migrationBuilder.DropColumn(
                name: "Slug",
                table: "PegiDescription");

            migrationBuilder.RenameTable(
                name: "Video",
                newName: "Videos");

            migrationBuilder.RenameTable(
                name: "Serie",
                newName: "Series");

            migrationBuilder.RenameTable(
                name: "PegiDescription",
                newName: "PegiDescriptions");

            migrationBuilder.RenameTable(
                name: "GamePegiDescription",
                newName: "game_pegi_descriptions");

            migrationBuilder.RenameTable(
                name: "FranchiseGame",
                newName: "game_franchises");

            migrationBuilder.RenameTable(
                name: "Franchise",
                newName: "Franchises");

            migrationBuilder.RenameColumn(
                name: "PlatformFamily",
                table: "Platforms",
                newName: "PlatformFamilyId");

            migrationBuilder.RenameColumn(
                name: "PlatformLogoId",
                table: "Platforms",
                newName: "PlatformFamilyId1");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_PlatformFamily",
                table: "Platforms",
                newName: "IX_Platforms_PlatformFamilyId");

            migrationBuilder.RenameColumn(
                name: "CoverId",
                table: "Images",
                newName: "PlatformId1");

            migrationBuilder.RenameColumn(
                name: "Game2Id",
                table: "game_expansions",
                newName: "Game3Id");

            migrationBuilder.RenameIndex(
                name: "IX_game_expansions_Game2Id",
                table: "game_expansions",
                newName: "IX_game_expansions_Game3Id");

            migrationBuilder.RenameColumn(
                name: "Game1Id",
                table: "game_expanded_games",
                newName: "Game2Id");

            migrationBuilder.RenameIndex(
                name: "IX_game_expanded_games_Game1Id",
                table: "game_expanded_games",
                newName: "IX_game_expanded_games_Game2Id");

            migrationBuilder.RenameColumn(
                name: "GameId",
                table: "game_dlcs",
                newName: "Game1Id");

            migrationBuilder.RenameIndex(
                name: "IX_game_dlcs_GameId",
                table: "game_dlcs",
                newName: "IX_game_dlcs_Game1Id");

            migrationBuilder.RenameIndex(
                name: "IX_Video_GameId",
                table: "Videos",
                newName: "IX_Videos_GameId");

            migrationBuilder.RenameIndex(
                name: "IX_Video_ApiVideoId",
                table: "Videos",
                newName: "IX_Videos_ApiVideoId");

            migrationBuilder.RenameIndex(
                name: "IX_GamePegiDescription_PegiDescriptionsId",
                table: "game_pegi_descriptions",
                newName: "IX_game_pegi_descriptions_PegiDescriptionsId");

            migrationBuilder.RenameIndex(
                name: "IX_FranchiseGame_GamesId",
                table: "game_franchises",
                newName: "IX_game_franchises_GamesId");

            migrationBuilder.AlterColumn<string>(
                name: "Theme",
                table: "Users",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10,
                oldDefaultValue: "Light");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Themes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Themes",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<long>(
                name: "ApiThemeId",
                table: "Themes",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<long>(
                name: "GameId1",
                table: "Reviews",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "UserId1",
                table: "Reviews",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Platforms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Platforms",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<long>(
                name: "ApiPlatformId",
                table: "Platforms",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Abbreviation",
                table: "Platforms",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<long>(
                name: "PlatformFamilyId",
                table: "Platforms",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "PlatformFamilies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PlatformFamilies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<long>(
                name: "ApiPlatformFamilyId",
                table: "PlatformFamilies",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "LoginChallenges",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "LoginChallenges",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddColumn<long>(
                name: "UserId1",
                table: "LoginChallenges",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Keywords",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Keywords",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Images",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Images",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "ApiImageId",
                table: "Images",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<long>(
                name: "CompanyId",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "CompanyId1",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "GameId",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "GameId1",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "PlatformId",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "Images",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Genres",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Genres",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<long>(
                name: "ApiGenreId",
                table: "Genres",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AlterColumn<string>(
                name: "Summary",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "PegiRating",
                table: "Games",
                type: "text",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "GameType",
                table: "Games",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Friendships",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Companies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Companies",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Videos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Videos",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "ApiVideoId",
                table: "Videos",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500);

            migrationBuilder.AddColumn<long>(
                name: "GameId1",
                table: "Videos",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Series",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Series",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Series",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Series",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "PegiDescriptions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "PegiDescriptions",
                type: "character varying(16)",
                maxLength: 16,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PegiDescriptions",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Franchises",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Franchises",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Franchises",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Franchises",
                type: "timestamp with time zone",
                nullable: false,
                defaultValueSql: "NOW()",
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Videos",
                table: "Videos",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Series",
                table: "Series",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PegiDescriptions",
                table: "PegiDescriptions",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_game_pegi_descriptions",
                table: "game_pegi_descriptions",
                columns: new[] { "GamesId", "PegiDescriptionsId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_game_franchises",
                table: "game_franchises",
                columns: new[] { "FranchisesId", "GamesId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Franchises",
                table: "Franchises",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "game_bundles",
                columns: table => new
                {
                    BundlesId = table.Column<long>(type: "bigint", nullable: false),
                    GameId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_bundles", x => new { x.BundlesId, x.GameId });
                    table.ForeignKey(
                        name: "FK_game_bundles_Games_BundlesId",
                        column: x => x.BundlesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_bundles_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_forks",
                columns: table => new
                {
                    ForksId = table.Column<long>(type: "bigint", nullable: false),
                    Game4Id = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_forks", x => new { x.ForksId, x.Game4Id });
                    table.ForeignKey(
                        name: "FK_game_forks_Games_ForksId",
                        column: x => x.ForksId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_forks_Games_Game4Id",
                        column: x => x.Game4Id,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_remakes",
                columns: table => new
                {
                    Game5Id = table.Column<long>(type: "bigint", nullable: false),
                    RemakesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_remakes", x => new { x.Game5Id, x.RemakesId });
                    table.ForeignKey(
                        name: "FK_game_remakes_Games_Game5Id",
                        column: x => x.Game5Id,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_remakes_Games_RemakesId",
                        column: x => x.RemakesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_remasters",
                columns: table => new
                {
                    Game6Id = table.Column<long>(type: "bigint", nullable: false),
                    RemastersId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_remasters", x => new { x.Game6Id, x.RemastersId });
                    table.ForeignKey(
                        name: "FK_game_remasters_Games_Game6Id",
                        column: x => x.Game6Id,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_remasters_Games_RemastersId",
                        column: x => x.RemastersId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GameModes",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiGameModeId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameModes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LanguageSupports",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Language = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    GameId = table.Column<long>(type: "bigint", nullable: false),
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LanguageSupports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LanguageSupports_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_LanguageSupports_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Perspectives",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    ApiPerspectiveId = table.Column<long>(type: "bigint", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Slug = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Perspectives", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ReleaseDate",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Date = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Platform = table.Column<string>(type: "text", nullable: false),
                    GameId = table.Column<long>(type: "bigint", nullable: false),
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReleaseDate", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ReleaseDate_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ReleaseDate_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Websites",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Type = table.Column<long>(type: "bigint", nullable: false),
                    IsStore = table.Column<bool>(type: "boolean", nullable: false),
                    GameId = table.Column<long>(type: "bigint", nullable: true),
                    GameId1 = table.Column<long>(type: "bigint", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Websites", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Websites_Games_GameId",
                        column: x => x.GameId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Websites_Games_GameId1",
                        column: x => x.GameId1,
                        principalTable: "Games",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "game_game_modes",
                columns: table => new
                {
                    GameModesId = table.Column<long>(type: "bigint", nullable: false),
                    GamesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_game_modes", x => new { x.GameModesId, x.GamesId });
                    table.ForeignKey(
                        name: "FK_game_game_modes_GameModes_GameModesId",
                        column: x => x.GameModesId,
                        principalTable: "GameModes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_game_modes_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "game_perspectives",
                columns: table => new
                {
                    GamesId = table.Column<long>(type: "bigint", nullable: false),
                    PerspectivesId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_perspectives", x => new { x.GamesId, x.PerspectivesId });
                    table.ForeignKey(
                        name: "FK_game_perspectives_Games_GamesId",
                        column: x => x.GamesId,
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_perspectives_Perspectives_PerspectivesId",
                        column: x => x.PerspectivesId,
                        principalTable: "Perspectives",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_GameId1",
                table: "Reviews",
                column: "GameId1");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId1",
                table: "Reviews",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_PlatformFamilyId1",
                table: "Platforms",
                column: "PlatformFamilyId1");

            migrationBuilder.CreateIndex(
                name: "IX_LoginChallenges_UserId1",
                table: "LoginChallenges",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_Images_CompanyId",
                table: "Images",
                column: "CompanyId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Images_CompanyId1",
                table: "Images",
                column: "CompanyId1");

            migrationBuilder.CreateIndex(
                name: "IX_Images_GameId",
                table: "Images",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_GameId1",
                table: "Images",
                column: "GameId1");

            migrationBuilder.CreateIndex(
                name: "IX_Images_PlatformId",
                table: "Images",
                column: "PlatformId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Images_PlatformId1",
                table: "Images",
                column: "PlatformId1");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_GameId1",
                table: "Videos",
                column: "GameId1");

            migrationBuilder.CreateIndex(
                name: "IX_Series_ApiSerieId",
                table: "Series",
                column: "ApiSerieId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Series_Slug",
                table: "Series",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PegiDescriptions_Name",
                table: "PegiDescriptions",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Franchises_ApiFranchiseId",
                table: "Franchises",
                column: "ApiFranchiseId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Franchises_Slug",
                table: "Franchises",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_game_bundles_GameId",
                table: "game_bundles",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_game_forks_Game4Id",
                table: "game_forks",
                column: "Game4Id");

            migrationBuilder.CreateIndex(
                name: "IX_game_game_modes_GamesId",
                table: "game_game_modes",
                column: "GamesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_perspectives_PerspectivesId",
                table: "game_perspectives",
                column: "PerspectivesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_remakes_RemakesId",
                table: "game_remakes",
                column: "RemakesId");

            migrationBuilder.CreateIndex(
                name: "IX_game_remasters_RemastersId",
                table: "game_remasters",
                column: "RemastersId");

            migrationBuilder.CreateIndex(
                name: "IX_GameModes_ApiGameModeId",
                table: "GameModes",
                column: "ApiGameModeId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GameModes_Name",
                table: "GameModes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_GameModes_Slug",
                table: "GameModes",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LanguageSupports_GameId_Language_Type",
                table: "LanguageSupports",
                columns: new[] { "GameId", "Language", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_LanguageSupports_GamesId",
                table: "LanguageSupports",
                column: "GamesId");

            migrationBuilder.CreateIndex(
                name: "IX_LanguageSupports_Language_Type",
                table: "LanguageSupports",
                columns: new[] { "Language", "Type" });

            migrationBuilder.CreateIndex(
                name: "IX_Perspectives_ApiPerspectiveId",
                table: "Perspectives",
                column: "ApiPerspectiveId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Perspectives_Slug",
                table: "Perspectives",
                column: "Slug",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReleaseDate_GameId_Platform_Status",
                table: "ReleaseDate",
                columns: new[] { "GameId", "Platform", "Status" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ReleaseDate_GamesId",
                table: "ReleaseDate",
                column: "GamesId");

            migrationBuilder.CreateIndex(
                name: "IX_Websites_GameId_Type",
                table: "Websites",
                columns: new[] { "GameId", "Type" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Websites_GameId1",
                table: "Websites",
                column: "GameId1");

            migrationBuilder.CreateIndex(
                name: "IX_Websites_Url",
                table: "Websites",
                column: "Url",
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
                name: "FK_game_dlcs_Games_Game1Id",
                table: "game_dlcs",
                column: "Game1Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_expanded_games_Games_Game2Id",
                table: "game_expanded_games",
                column: "Game2Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_expansions_Games_Game3Id",
                table: "game_expansions",
                column: "Game3Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_franchises_Franchises_FranchisesId",
                table: "game_franchises",
                column: "FranchisesId",
                principalTable: "Franchises",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_franchises_Games_GamesId",
                table: "game_franchises",
                column: "GamesId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_pegi_descriptions_Games_GamesId",
                table: "game_pegi_descriptions",
                column: "GamesId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_pegi_descriptions_PegiDescriptions_PegiDescriptionsId",
                table: "game_pegi_descriptions",
                column: "PegiDescriptionsId",
                principalTable: "PegiDescriptions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_series_Series_SeriesId",
                table: "game_series",
                column: "SeriesId",
                principalTable: "Series",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Companies_CompanyId",
                table: "Images",
                column: "CompanyId",
                principalTable: "Companies",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Companies_CompanyId1",
                table: "Images",
                column: "CompanyId1",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Games_GameId",
                table: "Images",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Games_GameId1",
                table: "Images",
                column: "GameId1",
                principalTable: "Games",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Platforms_PlatformId",
                table: "Images",
                column: "PlatformId",
                principalTable: "Platforms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Platforms_PlatformId1",
                table: "Images",
                column: "PlatformId1",
                principalTable: "Platforms",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LoginChallenges_Users_UserId",
                table: "LoginChallenges",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_LoginChallenges_Users_UserId1",
                table: "LoginChallenges",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamilyId",
                table: "Platforms",
                column: "PlatformFamilyId",
                principalTable: "PlatformFamilies",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamilyId1",
                table: "Platforms",
                column: "PlatformFamilyId1",
                principalTable: "PlatformFamilies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Games_GameId1",
                table: "Reviews",
                column: "GameId1",
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

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Users_UserId1",
                table: "Reviews",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Videos_Games_GameId",
                table: "Videos",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Videos_Games_GameId1",
                table: "Videos",
                column: "GameId1",
                principalTable: "Games",
                principalColumn: "Id");
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
                name: "FK_game_dlcs_Games_Game1Id",
                table: "game_dlcs");

            migrationBuilder.DropForeignKey(
                name: "FK_game_expanded_games_Games_Game2Id",
                table: "game_expanded_games");

            migrationBuilder.DropForeignKey(
                name: "FK_game_expansions_Games_Game3Id",
                table: "game_expansions");

            migrationBuilder.DropForeignKey(
                name: "FK_game_franchises_Franchises_FranchisesId",
                table: "game_franchises");

            migrationBuilder.DropForeignKey(
                name: "FK_game_franchises_Games_GamesId",
                table: "game_franchises");

            migrationBuilder.DropForeignKey(
                name: "FK_game_pegi_descriptions_Games_GamesId",
                table: "game_pegi_descriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_game_pegi_descriptions_PegiDescriptions_PegiDescriptionsId",
                table: "game_pegi_descriptions");

            migrationBuilder.DropForeignKey(
                name: "FK_game_series_Series_SeriesId",
                table: "game_series");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Companies_CompanyId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Companies_CompanyId1",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Games_GameId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Games_GameId1",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Platforms_PlatformId",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Platforms_PlatformId1",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginChallenges_Users_UserId",
                table: "LoginChallenges");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginChallenges_Users_UserId1",
                table: "LoginChallenges");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamilyId",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamilyId1",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_GameId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_GameId1",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId1",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Videos_Games_GameId",
                table: "Videos");

            migrationBuilder.DropForeignKey(
                name: "FK_Videos_Games_GameId1",
                table: "Videos");

            migrationBuilder.DropTable(
                name: "game_bundles");

            migrationBuilder.DropTable(
                name: "game_forks");

            migrationBuilder.DropTable(
                name: "game_game_modes");

            migrationBuilder.DropTable(
                name: "game_perspectives");

            migrationBuilder.DropTable(
                name: "game_remakes");

            migrationBuilder.DropTable(
                name: "game_remasters");

            migrationBuilder.DropTable(
                name: "LanguageSupports");

            migrationBuilder.DropTable(
                name: "ReleaseDate");

            migrationBuilder.DropTable(
                name: "Websites");

            migrationBuilder.DropTable(
                name: "GameModes");

            migrationBuilder.DropTable(
                name: "Perspectives");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_GameId1",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_UserId1",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_PlatformFamilyId1",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_LoginChallenges_UserId1",
                table: "LoginChallenges");

            migrationBuilder.DropIndex(
                name: "IX_Images_CompanyId",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_CompanyId1",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_GameId",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_GameId1",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_PlatformId",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_PlatformId1",
                table: "Images");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Videos",
                table: "Videos");

            migrationBuilder.DropIndex(
                name: "IX_Videos_GameId1",
                table: "Videos");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Series",
                table: "Series");

            migrationBuilder.DropIndex(
                name: "IX_Series_ApiSerieId",
                table: "Series");

            migrationBuilder.DropIndex(
                name: "IX_Series_Slug",
                table: "Series");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PegiDescriptions",
                table: "PegiDescriptions");

            migrationBuilder.DropIndex(
                name: "IX_PegiDescriptions_Name",
                table: "PegiDescriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_game_pegi_descriptions",
                table: "game_pegi_descriptions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_game_franchises",
                table: "game_franchises");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Franchises",
                table: "Franchises");

            migrationBuilder.DropIndex(
                name: "IX_Franchises_ApiFranchiseId",
                table: "Franchises");

            migrationBuilder.DropIndex(
                name: "IX_Franchises_Slug",
                table: "Franchises");

            migrationBuilder.DropColumn(
                name: "GameId1",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "LoginChallenges");

            migrationBuilder.DropColumn(
                name: "CompanyId",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "CompanyId1",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "GameId",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "GameId1",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "PlatformId",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "GameId1",
                table: "Videos");

            migrationBuilder.RenameTable(
                name: "Videos",
                newName: "Video");

            migrationBuilder.RenameTable(
                name: "Series",
                newName: "Serie");

            migrationBuilder.RenameTable(
                name: "PegiDescriptions",
                newName: "PegiDescription");

            migrationBuilder.RenameTable(
                name: "game_pegi_descriptions",
                newName: "GamePegiDescription");

            migrationBuilder.RenameTable(
                name: "game_franchises",
                newName: "FranchiseGame");

            migrationBuilder.RenameTable(
                name: "Franchises",
                newName: "Franchise");

            migrationBuilder.RenameColumn(
                name: "PlatformFamilyId",
                table: "Platforms",
                newName: "PlatformFamily");

            migrationBuilder.RenameColumn(
                name: "PlatformFamilyId1",
                table: "Platforms",
                newName: "PlatformLogoId");

            migrationBuilder.RenameIndex(
                name: "IX_Platforms_PlatformFamilyId",
                table: "Platforms",
                newName: "IX_Platforms_PlatformFamily");

            migrationBuilder.RenameColumn(
                name: "PlatformId1",
                table: "Images",
                newName: "CoverId");

            migrationBuilder.RenameColumn(
                name: "Game3Id",
                table: "game_expansions",
                newName: "Game2Id");

            migrationBuilder.RenameIndex(
                name: "IX_game_expansions_Game3Id",
                table: "game_expansions",
                newName: "IX_game_expansions_Game2Id");

            migrationBuilder.RenameColumn(
                name: "Game2Id",
                table: "game_expanded_games",
                newName: "Game1Id");

            migrationBuilder.RenameIndex(
                name: "IX_game_expanded_games_Game2Id",
                table: "game_expanded_games",
                newName: "IX_game_expanded_games_Game1Id");

            migrationBuilder.RenameColumn(
                name: "Game1Id",
                table: "game_dlcs",
                newName: "GameId");

            migrationBuilder.RenameIndex(
                name: "IX_game_dlcs_Game1Id",
                table: "game_dlcs",
                newName: "IX_game_dlcs_GameId");

            migrationBuilder.RenameIndex(
                name: "IX_Videos_GameId",
                table: "Video",
                newName: "IX_Video_GameId");

            migrationBuilder.RenameIndex(
                name: "IX_Videos_ApiVideoId",
                table: "Video",
                newName: "IX_Video_ApiVideoId");

            migrationBuilder.RenameIndex(
                name: "IX_game_pegi_descriptions_PegiDescriptionsId",
                table: "GamePegiDescription",
                newName: "IX_GamePegiDescription_PegiDescriptionsId");

            migrationBuilder.RenameIndex(
                name: "IX_game_franchises_GamesId",
                table: "FranchiseGame",
                newName: "IX_FranchiseGame_GamesId");

            migrationBuilder.AlterColumn<string>(
                name: "Theme",
                table: "Users",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "Light",
                oldClrType: typeof(string),
                oldType: "character varying(10)",
                oldMaxLength: 10);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Themes",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Themes",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<int>(
                name: "ApiThemeId",
                table: "Themes",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Platforms",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Platforms",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<int>(
                name: "ApiPlatformId",
                table: "Platforms",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<string>(
                name: "Abbreviation",
                table: "Platforms",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<int>(
                name: "PlatformFamily",
                table: "Platforms",
                type: "integer",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "PlatformFamilies",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PlatformFamilies",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<int>(
                name: "ApiPlatformFamilyId",
                table: "PlatformFamilies",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "LoginChallenges",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "LoginChallenges",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Keywords",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Keywords",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Images",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Images",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<string>(
                name: "ApiImageId",
                table: "Images",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Genres",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Genres",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<int>(
                name: "ApiGenreId",
                table: "Genres",
                type: "integer",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<string>(
                name: "Summary",
                table: "Games",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PegiRating",
                table: "Games",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "GameType",
                table: "Games",
                type: "integer",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30,
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "CoverId",
                table: "Games",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "Friendships",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(30)",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Companies",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Companies",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AddColumn<long>(
                name: "CompanyLogoId",
                table: "Companies",
                type: "bigint",
                nullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Video",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Video",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<string>(
                name: "ApiVideoId",
                table: "Video",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Serie",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Serie",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Serie",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Serie",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "PegiDescription",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "PegiDescription",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(16)",
                oldMaxLength: 16);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "PegiDescription",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AddColumn<string>(
                name: "Slug",
                table: "PegiDescription",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<DateTime>(
                name: "UpdatedAt",
                table: "Franchise",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AlterColumn<string>(
                name: "Slug",
                table: "Franchise",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "Franchise",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CreatedAt",
                table: "Franchise",
                type: "timestamp with time zone",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "timestamp with time zone",
                oldDefaultValueSql: "NOW()");

            migrationBuilder.AddUniqueConstraint(
                name: "AK_PlatformFamilies_ApiPlatformFamilyId",
                table: "PlatformFamilies",
                column: "ApiPlatformFamilyId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Video",
                table: "Video",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Serie",
                table: "Serie",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PegiDescription",
                table: "PegiDescription",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_GamePegiDescription",
                table: "GamePegiDescription",
                columns: new[] { "GamesId", "PegiDescriptionsId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_FranchiseGame",
                table: "FranchiseGame",
                columns: new[] { "FranchisesId", "GamesId" });

            migrationBuilder.AddPrimaryKey(
                name: "PK_Franchise",
                table: "Franchise",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "game_artworks",
                columns: table => new
                {
                    ArtworksId = table.Column<long>(type: "bigint", nullable: false),
                    GamesAsArtworkId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_artworks", x => new { x.ArtworksId, x.GamesAsArtworkId });
                    table.ForeignKey(
                        name: "FK_game_artworks_Games_GamesAsArtworkId",
                        column: x => x.GamesAsArtworkId,
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
                    GamesAsScreenshotId = table.Column<long>(type: "bigint", nullable: false),
                    ScreenshotsId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_screenshots", x => new { x.GamesAsScreenshotId, x.ScreenshotsId });
                    table.ForeignKey(
                        name: "FK_game_screenshots_Games_GamesAsScreenshotId",
                        column: x => x.GamesAsScreenshotId,
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

            migrationBuilder.CreateIndex(
                name: "IX_Themes_Name",
                table: "Themes",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_Name",
                table: "Platforms",
                column: "Name");

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_PlatformLogoId",
                table: "Platforms",
                column: "PlatformLogoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Games_CoverId",
                table: "Games",
                column: "CoverId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Companies_CompanyLogoId",
                table: "Companies",
                column: "CompanyLogoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_game_artworks_GamesAsArtworkId",
                table: "game_artworks",
                column: "GamesAsArtworkId");

            migrationBuilder.CreateIndex(
                name: "IX_game_screenshots_ScreenshotsId",
                table: "game_screenshots",
                column: "ScreenshotsId");

            migrationBuilder.AddForeignKey(
                name: "FK_Companies_Images_CompanyLogoId",
                table: "Companies",
                column: "CompanyLogoId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_FranchiseGame_Franchise_FranchisesId",
                table: "FranchiseGame",
                column: "FranchisesId",
                principalTable: "Franchise",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_FranchiseGame_Games_GamesId",
                table: "FranchiseGame",
                column: "GamesId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_game_dlcs_Games_GameId",
                table: "game_dlcs",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_expanded_games_Games_Game1Id",
                table: "game_expanded_games",
                column: "Game1Id",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_game_expansions_Games_Game2Id",
                table: "game_expansions",
                column: "Game2Id",
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
                name: "FK_GamePegiDescription_Games_GamesId",
                table: "GamePegiDescription",
                column: "GamesId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GamePegiDescription_PegiDescription_PegiDescriptionsId",
                table: "GamePegiDescription",
                column: "PegiDescriptionsId",
                principalTable: "PegiDescription",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

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
                name: "FK_Platforms_Images_PlatformLogoId",
                table: "Platforms",
                column: "PlatformLogoId",
                principalTable: "Images",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamily",
                table: "Platforms",
                column: "PlatformFamily",
                principalTable: "PlatformFamilies",
                principalColumn: "ApiPlatformFamilyId",
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

            migrationBuilder.AddForeignKey(
                name: "FK_Video_Games_GameId",
                table: "Video",
                column: "GameId",
                principalTable: "Games",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
