using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Friendship
{
    public long Id { get; set; }
    public long User1Id { get; set; }
    public long User2Id { get; set; }
    public long ReceiverId { get; set; }
    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;

    public User User1 { get; set; } = null!;
    public User User2 { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}