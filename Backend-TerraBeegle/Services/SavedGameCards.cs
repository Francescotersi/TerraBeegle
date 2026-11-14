using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Services;

public static class SavedGameCards
{
    public static GameCardDTO Map(Game game) => new()
    {
        ApiGameId = game.ApiGameId,
        Name = game.Name,
        Slug = game.Slug,
        Cover = game.Images.FirstOrDefault(i => i.Type == ImageType.Cover) is {} cover ? $"https://images.igdb.com/igdb/image/upload/t_cover_big/{cover.ApiImageId}.jpg" : null,
        Rating = game.Rating.HasValue ? (double)game.Rating.Value : null,
        CriticRating = game.AggregatedRating,
        ReleaseDate = game.ReleaseDate,
        GameType = game.GameType?.ToString(),
        GameStatus = game.GameStatus?.ToString(),
        Genres = [.. game.Genres.Select(g => new ApiObjectDTO { Id = g.ApiGenreId, Name = g.Name, Slug = g.Slug })],
        Platforms = [.. game.Platforms?.Select(p => new PlatformDTO
        { ApiPlatformId = p.ApiPlatformId, Name = p.Name, Slug = p.Slug, Abbreviation = p.Abbreviation }) ?? []],
        Themes = [.. game.Themes.Select(t => new ApiObjectDTO { Id = t.ApiThemeId, Name = t.Name, Slug = t.Slug })]
    };
}
