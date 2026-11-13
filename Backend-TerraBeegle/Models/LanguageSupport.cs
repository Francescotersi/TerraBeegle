using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class LanguageSupport
{
    public long Id { get; set; }
    public string Language { get; set; } = null!;
    public LanguageSupportType Type { get; set; }

    public long GameId { get; set; }
    public Game Games { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}