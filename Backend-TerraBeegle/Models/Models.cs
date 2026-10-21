namespace Backend_TerraBeegle.Models;

public class ChallengeItem
{
	public int Id { get; set; }
	public string Title { get; set; } = string.Empty;
	public string Description { get; set; } = string.Empty;
	public bool IsCompleted { get; set; }
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class User
{
	public int Id { get; set; }
	public string Name { get; set; } = string.Empty;
	public string Surname { get; set; } = string.Empty;
	public string Email { get; set; } = string.Empty;
	public FileInfo ProfilePicture { get; set; } = new FileInfo();
	public string Username { get; set; } = string.Empty;
	public string PasswordHash { get; set; } = string.Empty;
	public string Theme { get; set; } = "light";
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Games
{
	public int Id { get; set; }
	public int RawgId { get; set; }
	public string Title { get; set; } = string.Empty;
	public string Slug { get; set; } = string.Empty;
	public string Description { get; set; } = string.Empty;
	public DateTime ReleaseDate { get; set; }
	public string ImageUrl { get; set; } = string.Empty;
	public int PegiRating { get; set; }
	public string Series { get; set; } = string.Empty;
	public string[] Genres { get; set; } = [];
	public string[] Platforms { get; set; } = [];
	public string[] Developers { get; set; } = [];
	public string[] Publishers { get; set; } = [];
	public string[] Tags { get; set; } = [];
	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}