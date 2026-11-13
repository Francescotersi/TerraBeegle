namespace Backend_TerraBeegle.DTOS;

public record GameCardDTO
{
    public long ApiGameId { get; init; }
    public string Name { get; init; } = null!;
    public string Slug { get; init; } = null!;
    public string? Cover { get; init; }
    public double? Rating { get; init; }
    public int? CriticRating { get; init; }
    public string? GameType { get; init; }
    public string? GameStatus { get; init; }
    public DateOnly? ReleaseDate { get; init; }
    public List<ApiObjectDTO>? Genres { get; init; } = [];
    public List<PlatformDTO>? Platforms { get; init; } = [];
    public List<ApiObjectDTO>? Themes { get; init; } = [];
}

public record GameDetailsDTO
{
    public long ApiGameId { get; init; }
    public string Name { get; init; } = null!;
    public string? PegiRating { get; init; }
    public IEnumerable<string>? PegiRatingDescription { get; init; }
    public int? CriticRating { get; init; }
    public int? CriticRatingCount { get; init; }
    public IEnumerable<string>? Artworks { get; init; }
    public string? Cover { get; init; }
    public DateOnly? ReleaseDate { get; init; }
    public IEnumerable<ApiObjectDTO>? Franchises { get; init; }
    public IEnumerable<ApiObjectDTO>? GameModes { get; init; }
    public string? GameStatus { get; init; }
    public IEnumerable<ApiObjectDTO>? Genres { get; init; }
    public List<CompanyDTO>? Developers { get; init; }
    public List<CompanyDTO>? Publishers { get; init; }
    public IEnumerable<ApiObjectDTO>? Keywords { get; init; }
    public IEnumerable<PlatformDTO>? Platforms { get; init; }
    public IEnumerable<ApiObjectDTO>? Perspectives { get; init; }
    public double? Rating { get; init; }
    public int? RatingCount { get; init; }
    public IEnumerable<ReleaseDateDTO>? ReleaseDates { get; init; }
    public IEnumerable<string>? Screenshots { get; init; }
    public string Slug { get; init; } = null!;
    public string? Summary { get; init; } = null!;
    public string? Storyline { get; init; } = null!;
    public IEnumerable<ApiObjectDTO>? Themes { get; init; }
    public IEnumerable<VideoDTO>? Videos { get; init; }
    public string? OfficialWebsite { get; init; }
    public IEnumerable<WebsiteDTO>? Websites { get; init; }
    public IEnumerable<WebsiteDTO>? Stores { get; init; }
    public IEnumerable<LanguageSupportDTO>? LanguageSupports { get; init; }
    public IEnumerable<SerieDTO>? Series { get; init; }
    public string? GameType { get; init; }
    public IEnumerable<GameCardDTO>? Bundles { get; init; }
    public IEnumerable<GameCardDTO>? Dlcs { get; init; }
    public IEnumerable<GameCardDTO>? ExpandedGames { get; init; }
    public IEnumerable<GameCardDTO>? Expansions { get; init; }
    public IEnumerable<GameCardDTO>? Forks { get; init; }
    public GameCardDTO? ParentGame { get; init; }
    public IEnumerable<GameCardDTO>? Ports { get; init; }
    public IEnumerable<GameCardDTO>? SimilarGames { get; init; }
    public IEnumerable<GameCardDTO>? StandaloneExpansions { get; init; }
    public IEnumerable<GameCardDTO>? Remakes { get; init; }
    public IEnumerable<GameCardDTO>? Remasters { get; init; }
    public GameCardDTO? VersionParent { get; init; }
}