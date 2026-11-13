namespace Backend_TerraBeegle.Models;

public class LoginChallenge
{
    public long Id { get; set; }

    public long UserId { get; set; }
    public User User { get; set; } = null!;

    public string TokenHash { get; set; } = null!;
    public DateTime TokenExpiration { get; set; }
    
    public string CodeHash { get; set; } = null!;
    public DateTime CodeExpiration { get; set; }
    public int CodeAttempts { get; set; }
}
