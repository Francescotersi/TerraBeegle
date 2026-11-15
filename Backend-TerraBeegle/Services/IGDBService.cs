using Backend_TerraBeegle.DTOS;
using System.Globalization;
using System.Linq.Expressions;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using IGDB;
using IGDB.Models;

namespace Backend_TerraBeegle.Services;

// All the communication with the IGDB API: key, URLs, JSON options and mapping to our DTOs
public class IGDBService(AppDbContext db, IGDBClient igdb) : IIGDBService
{
    public static readonly string GameCardFields = "fields " + string.Join(",", [
        "id",
        "name",
        "slug",
        "first_release_date",
        "aggregated_rating",
        "rating",
        "cover.image_id",
        "genres.name",
        "genres.slug",
        "platforms.name",
        "platforms.slug",
        "platforms.abbreviation",
        "platforms.platform_logo.image_id",
        "themes.name",
        "themes.slug",
        "game_type.type",
        "game_status.status"
    ]) + ";";

    public async Task<GameSearchResponseDTO?> SearchGamesAsync(string query, string pagination)
    {
        Game[]? response;
        CountResponse totalCount;

        try
        {
            response = await igdb.QueryAsync<Game>(IGDBClient.Endpoints.Games, query: $"{GameCardFields}{(query.Length > 0 ? $"where {query};" : "")}{pagination}");
            totalCount = await igdb.CountAsync(IGDBClient.Endpoints.Games, query: query.Length > 0 ? $"where {query};" : "");
        }
        catch (RestEase.ApiException ex)
        {
            Console.WriteLine($"IGDB API error: {ex.StatusCode} - {ex.Content}");
            return null;
        }

        if (response is not { Length: > 0 })
        {
            return new GameSearchResponseDTO { 
                Results = [],
                Count = totalCount.Count
            };
        }

        return new GameSearchResponseDTO {
            Results = response.Select(IGDBToGameDTO.ToGameCardDTO),
            Count = totalCount.Count
        };
    }

    private static readonly string GameDetailsFields = "fields " + string.Join(",", [
        "id",
        "name",
        "age_ratings.organization",
        "age_ratings.rating_category.rating",
        "age_ratings.rating_content_descriptions.description",
        "aggregated_rating",
        "aggregated_rating_count",
        "artworks.image_id",
        "cover.image_id",
        "first_release_date",
        "game_status.status",
        "involved_companies.developer",
        "involved_companies.publisher",
        "involved_companies.company.logo.image_id",
        "platforms.abbreviation",
        "platforms.platform_logo.image_id",
        "rating",
        "rating_count",
        "release_dates.date",
        "release_dates.platform.name",
        "release_dates.status.name",
        "screenshots.image_id",
        "slug",
        "storyline",
        "summary",
        "videos.name",
        "videos.video_id",
        "websites.url",
        "websites.type",
        "language_supports.language.name",
        "language_supports.language_support_type.name",
        "game_type.type",
    ]) + "," + string.Join(",", new [] {
        "franchises",
        "game_modes",
        "genres",
        "involved_companies.company",
        "keywords",
        "platforms",
        "platforms.platform_family",
        "player_perspectives",
        "themes",
        "collections"
    }.Select(str => $"{str}.name,{str}.slug")) + "," + string.Join(",", new [] {
        "bundles", 
        "dlcs", 
        "expanded_games", 
        "expansions", 
        "forks", 
        "parent_game", 
        "ports", 
        "similar_games",
        "standalone_expansions",
        "remakes",
        "remasters",
        "version_parent",
        "collections.games"
    }.Select(str => $"{str}.name,{str}.slug,{str}.aggregated_rating,{str}.rating,{str}.cover.image_id,{str}.first_release_date,{str}.game_type.type")) + ";";

    private async Task<Game?> FetchGameAsync(string GameField, string field)
    {
        Game[]? response;
        try
        {
            response = await igdb.QueryAsync<Game>(IGDBClient.Endpoints.Games, query: $"{GameDetailsFields} w {field} = {GameField}; l 1;");
        }
        catch (RestEase.ApiException ex)
        {
            Console.WriteLine($"IGDB API error: {ex.StatusCode} - {ex.Content}");
            return null;
        }
        
        return response is { Length: 1 } ? response[0] : null;
    }

    // The only place where a game is looked up for GET /api/games/{id}
    public async Task<GameDetailsDTO?> GetGameAsync(string GameField, string field)
    {
        Expression<Func<Models.Game, bool>>? filter = field switch
        {
            "id" => g => g.ApiGameId == long.Parse(GameField, CultureInfo.InvariantCulture) && !g.IsPlaceholder,
            "slug" => g => g.Slug == GameField && !g.IsPlaceholder,
            _ => null
        };

        if (filter is null)
            return null;

        var existing = await db.Games.FirstOrDefaultAsync(filter);
        if (existing is not null)
            return DBToGameDTO.DBToGameDetailsDTO(existing);

        var response = await FetchGameAsync(GameField, field);
        if (response is null)
            return null;

        return IGDBToGameDTO.ToGameDetailsDTO(response);
    }

    // Import only the fields needed by saved collections. Shared taxonomy rows are reused.
    public async Task<Models.Game?> GetOrCreateGameAsync(long igdbGameId)
    {
        var existing = await db.Games.FirstOrDefaultAsync(g => g.ApiGameId == igdbGameId && !g.IsPlaceholder);
        if (existing is not null)
            return existing;

        Game[] response;
        try
        {
            response = await igdb.QueryAsync<Game>(IGDBClient.Endpoints.Games,query: $"{GameDetailsFields} w id = {igdbGameId}; l 1;");
        }
        catch (RestEase.ApiException ex)
        {
            throw new HttpRequestException("IGDB is unavailable.", ex);
        }

        if (response is null or not { Length: 1 })
            return null;

        return await SaveGames.SaveGame(db, response[0], igdbGameId);
    }
}