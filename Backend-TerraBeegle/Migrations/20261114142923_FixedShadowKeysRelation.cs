using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend_TerraBeegle.Migrations
{
    /// <inheritdoc />
    public partial class FixedShadowKeysRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Images_Companies_CompanyId1",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Games_GameId1",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_Images_Platforms_PlatformId1",
                table: "Images");

            migrationBuilder.DropForeignKey(
                name: "FK_LanguageSupports_Games_GamesId",
                table: "LanguageSupports");

            migrationBuilder.DropForeignKey(
                name: "FK_LoginChallenges_Users_UserId1",
                table: "LoginChallenges");

            migrationBuilder.DropForeignKey(
                name: "FK_Platforms_PlatformFamilies_PlatformFamilyId1",
                table: "Platforms");

            migrationBuilder.DropForeignKey(
                name: "FK_ReleaseDate_Games_GamesId",
                table: "ReleaseDate");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Games_GameId1",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Users_UserId1",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Videos_Games_GameId1",
                table: "Videos");

            migrationBuilder.DropForeignKey(
                name: "FK_Websites_Games_GameId1",
                table: "Websites");

            migrationBuilder.DropIndex(
                name: "IX_Websites_GameId1",
                table: "Websites");

            migrationBuilder.DropIndex(
                name: "IX_Videos_GameId1",
                table: "Videos");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_GameId1",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_Reviews_UserId1",
                table: "Reviews");

            migrationBuilder.DropIndex(
                name: "IX_ReleaseDate_GamesId",
                table: "ReleaseDate");

            migrationBuilder.DropIndex(
                name: "IX_Platforms_PlatformFamilyId1",
                table: "Platforms");

            migrationBuilder.DropIndex(
                name: "IX_LoginChallenges_UserId1",
                table: "LoginChallenges");

            migrationBuilder.DropIndex(
                name: "IX_LanguageSupports_GamesId",
                table: "LanguageSupports");

            migrationBuilder.DropIndex(
                name: "IX_Images_CompanyId1",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_GameId1",
                table: "Images");

            migrationBuilder.DropIndex(
                name: "IX_Images_PlatformId1",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "GameId1",
                table: "Websites");

            migrationBuilder.DropColumn(
                name: "GameId1",
                table: "Videos");

            migrationBuilder.DropColumn(
                name: "GameId1",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "Reviews");

            migrationBuilder.DropColumn(
                name: "GamesId",
                table: "ReleaseDate");

            migrationBuilder.DropColumn(
                name: "PlatformFamilyId1",
                table: "Platforms");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "LoginChallenges");

            migrationBuilder.DropColumn(
                name: "GamesId",
                table: "LanguageSupports");

            migrationBuilder.DropColumn(
                name: "CompanyId1",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "GameId1",
                table: "Images");

            migrationBuilder.DropColumn(
                name: "PlatformId1",
                table: "Images");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "GameId1",
                table: "Websites",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "GameId1",
                table: "Videos",
                type: "bigint",
                nullable: true);

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

            migrationBuilder.AddColumn<long>(
                name: "GamesId",
                table: "ReleaseDate",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "PlatformFamilyId1",
                table: "Platforms",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "UserId1",
                table: "LoginChallenges",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "GamesId",
                table: "LanguageSupports",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "CompanyId1",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "GameId1",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "PlatformId1",
                table: "Images",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Websites_GameId1",
                table: "Websites",
                column: "GameId1");

            migrationBuilder.CreateIndex(
                name: "IX_Videos_GameId1",
                table: "Videos",
                column: "GameId1");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_GameId1",
                table: "Reviews",
                column: "GameId1");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_UserId1",
                table: "Reviews",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_ReleaseDate_GamesId",
                table: "ReleaseDate",
                column: "GamesId");

            migrationBuilder.CreateIndex(
                name: "IX_Platforms_PlatformFamilyId1",
                table: "Platforms",
                column: "PlatformFamilyId1");

            migrationBuilder.CreateIndex(
                name: "IX_LoginChallenges_UserId1",
                table: "LoginChallenges",
                column: "UserId1");

            migrationBuilder.CreateIndex(
                name: "IX_LanguageSupports_GamesId",
                table: "LanguageSupports",
                column: "GamesId");

            migrationBuilder.CreateIndex(
                name: "IX_Images_CompanyId1",
                table: "Images",
                column: "CompanyId1");

            migrationBuilder.CreateIndex(
                name: "IX_Images_GameId1",
                table: "Images",
                column: "GameId1");

            migrationBuilder.CreateIndex(
                name: "IX_Images_PlatformId1",
                table: "Images",
                column: "PlatformId1");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Companies_CompanyId1",
                table: "Images",
                column: "CompanyId1",
                principalTable: "Companies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Games_GameId1",
                table: "Images",
                column: "GameId1",
                principalTable: "Games",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Images_Platforms_PlatformId1",
                table: "Images",
                column: "PlatformId1",
                principalTable: "Platforms",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_LanguageSupports_Games_GamesId",
                table: "LanguageSupports",
                column: "GamesId",
                principalTable: "Games",
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
                name: "FK_Platforms_PlatformFamilies_PlatformFamilyId1",
                table: "Platforms",
                column: "PlatformFamilyId1",
                principalTable: "PlatformFamilies",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_ReleaseDate_Games_GamesId",
                table: "ReleaseDate",
                column: "GamesId",
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
                name: "FK_Reviews_Users_UserId1",
                table: "Reviews",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Videos_Games_GameId1",
                table: "Videos",
                column: "GameId1",
                principalTable: "Games",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Websites_Games_GameId1",
                table: "Websites",
                column: "GameId1",
                principalTable: "Games",
                principalColumn: "Id");
        }
    }
}
