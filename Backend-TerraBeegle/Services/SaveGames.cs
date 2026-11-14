using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using IGDB.Models;
using IGDB;

namespace Backend_TerraBeegle.Services;

public static class SaveGames
{
    public static GameCardDTO Map(Models.Game game) => new()
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

    // Serialize imports so concurrent saves can reuse games, genres, platforms and images safely.
    public static async Task<Models.Game?> SaveGamePlaceholder(AppDbContext db, IGDB.Models.Game? source)
    {
        if (source?.Id is not {} apiId)
            return null;

        var existing = db.Games.Local.FirstOrDefault(g => g.ApiGameId == apiId)
            ?? await db.Games.FirstOrDefaultAsync(g => g.ApiGameId == apiId);

        if (existing is not null)
            return existing;

        var placeholder = new Models.Game
        {
            ApiGameId = apiId,
            Name = source.Name,
            Slug = source.Slug,
            IsPlaceholder = true,
            Rating = source.Rating.HasValue ? (decimal)(source.Rating.Value / 10) : null,
            AggregatedRating = source.AggregatedRating.HasValue ? (int)Math.Round(source.AggregatedRating.Value) : null,
            ReleaseDate = source.FirstReleaseDate.HasValue ? DateOnly.FromDateTime(source.FirstReleaseDate.Value.UtcDateTime) : null,
            GameType = source.GameType?.Value?.Type,
            Images = []
        };

        if (await SaveMedia.GetOrCreateImageAsync(db, source.Cover?.Value?.ImageId, ImageType.Cover) is { } coverImg)
            placeholder.Images.Add(coverImg);

        db.Games.Add(placeholder);
        return placeholder;
    }

    public static async Task<List<Models.Game>> SaveGamesList(AppDbContext db, IdentitiesOrValues<IGDB.Models.Game>? games)
    {
        if (games?.Values is null)
            return [];

        List<Models.Game> result = [];

        foreach (var g in games.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            if (await SaveGamePlaceholder(db, g) is { } savedGame)
                result.Add(savedGame);
        }

        return result;
    }

    public static async Task<List<Models.Franchise>> SaveFranchises(AppDbContext db, IdentitiesOrValues<IGDB.Models.Franchise>? franchises)
    {
        if (franchises?.Values is null)
            return [];

        List<Models.Franchise> result = [];

        foreach (var f in franchises.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            var id = f.Id!.Value;
            var existing = db.Franchises.Local.FirstOrDefault(x => x.ApiFranchiseId == id)
                ?? await db.Franchises.FirstOrDefaultAsync(x => x.ApiFranchiseId == id);

            if (existing is null)
            {
                existing = new Models.Franchise
                {
                    ApiFranchiseId = id,
                    Name = f.Name,
                    Slug = f.Slug
                };
                db.Franchises.Add(existing);
            }

            result.Add(existing);
        }

        return result;
    }

    public static async Task<List<Serie>> SaveSeries(AppDbContext db, IdentitiesOrValues<Collection>? series)
    {
        if (series?.Values is null)
            return [];

        List<Serie> result = [];

        foreach (var s in series.Values.Where(x => x.Id.HasValue).DistinctBy(x => x.Id!.Value))
        {
            var id = s.Id!.Value;
            var existing = db.Series.Local.FirstOrDefault(x => x.ApiSerieId == id)
                ?? await db.Series.FirstOrDefaultAsync(x => x.ApiSerieId == id);

            if (existing is null)
            {
                existing = new Serie
                {
                    ApiSerieId = id,
                    Name = s.Name,
                    Slug = s.Slug,
                    Games = await SaveGamesList(db, s.Games)
                };
                db.Series.Add(existing);
            }

            result.Add(existing);
        }

        return result;
    }

    public static async Task<Models.Game> SaveGame(AppDbContext db, IGDB.Models.Game source, long igdbGameId)
    {
        await using var transaction = await db.Database.BeginTransactionAsync();
        
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(74219031)");
        
        var game = await db.Games
            .Include(g => g.Platforms)
            .Include(g => g.Genres)
            .Include(g => g.Keywords)
            .Include(g => g.Themes)
            .Include(g => g.GameModes)
            .Include(g => g.Perspectives)
            .Include(g => g.PegiDescriptions)
            .Include(g => g.Franchises)
            .Include(g => g.Series)
            .Include(g => g.Images)
            .Include(g => g.Videos)
            .Include(g => g.Websites)
            .Include(g => g.ReleaseDates)
            .Include(g => g.LanguageSupports)
            .Include(g => g.Developers)
            .Include(g => g.Publishers)
            .Include(g => g.Bundles)
            .Include(g => g.DLCs)
            .Include(g => g.ExpandedGames)
            .Include(g => g.Expansions)
            .Include(g => g.Forks)
            .Include(g => g.Remakes)
            .Include(g => g.Remasters)
            .Include(g => g.Reviews)
            .FirstOrDefaultAsync(g => g.ApiGameId == igdbGameId);
       
        if (game is { IsPlaceholder: false })
        {
            await transaction.CommitAsync();
            return game;
        }

        bool isNewGame = game is null;
        game ??= new Models.Game();

        game.ApiGameId = igdbGameId;
        game.Name = source.Name;
        game.Slug = source.Slug;
        game.IsPlaceholder = false;

        if (isNewGame)
            db.Games.Add(game);

        game.Summary = source.Summary;
        game.Storyline = source.Storyline;
        game.GameType = source.GameType?.Value?.Type;

        var pegiAgeRating = source.AgeRatings?.Values?.FirstOrDefault(ar => ar.Organization?.Id == 2);
        game.PegiRating = pegiAgeRating?.RatingCategory?.Value?.Rating;
        game.PegiDescriptions = await SaveGameContents.SavePegiDescriptions(db, pegiAgeRating?.RatingContentDescriptions?.Values);

        game.ReleaseDate = source.FirstReleaseDate.HasValue ? DateOnly.FromDateTime(source.FirstReleaseDate.Value.UtcDateTime) : null;
        game.ReleaseDates = SaveGameContents.SaveReleaseDates(source.ReleaseDates);
        game.GameStatus = source.GameStatus?.Value?.Status;
            
        game.Rating = source.Rating.HasValue ? (decimal)(source.Rating.Value / 10) : null;
        game.RatingCount = source.RatingCount ?? 0;
        game.AggregatedRating = source.AggregatedRating.HasValue ? (int)Math.Round(source.AggregatedRating.Value) : null;
        game.AggregatedRatingCount = source.AggregatedRatingCount ?? 0;
            
        game.Images = await SaveMedia.SaveImages(db, source.Artworks?.Values, source.Cover?.Value, source.Screenshots?.Values);
        game.Videos = await SaveMedia.SaveVideos(db, source.Videos?.Values);
        
        game.Platforms = await SavePlatforms.SavePlatformsList(db, source.Platforms);

        game.Genres = await SaveGameContents.SaveGenres(db, source.Genres);
        game.Themes = await SaveGameContents.SaveThemes(db, source.Themes);
        game.Keywords = await SaveGameContents.SaveKeywords(db, source.Keywords);
        game.GameModes = await SaveGameContents.SaveGameModes(db, source.GameModes);
        game.Perspectives = await SaveGameContents.SavePerspectives(db, source.PlayerPerspectives);
        game.LanguageSupports = SaveGameContents.SaveLanguageSupports(source.LanguageSupports);

        game.Websites = SaveGameContents.SaveWebsites(source.Websites);
        game.Developers = await SaveCompanies.SaveCompaniesList(db, source.InvolvedCompanies, true);
        game.Publishers = await SaveCompanies.SaveCompaniesList(db, source.InvolvedCompanies, false);

        game.ParentGame = await SaveGamePlaceholder(db, source.ParentGame?.Value);
        game.VersionParent = await SaveGamePlaceholder(db, source.VersionParent?.Value);

        game.Bundles = await SaveGamesList(db, source.Bundles);
        game.DLCs = await SaveGamesList(db, source.Dlcs);
        game.ExpandedGames = await SaveGamesList(db, source.ExpandedGames);
        game.Expansions = await SaveGamesList(db, source.Expansions);
        game.Forks = await SaveGamesList(db, source.Forks);
        game.Remakes = await SaveGamesList(db, source.Remakes);
        game.Remasters = await SaveGamesList(db, source.Remasters);

        game.Franchises = await SaveFranchises(db, source.Franchises);
        game.Series = await SaveSeries(db, source.Collections);

        game.Reviews ??= [];

        if (game.Id == 0)
            db.Games.Add(game);

        await db.SaveChangesAsync();
        await transaction.CommitAsync();

        return game;
    }
}
