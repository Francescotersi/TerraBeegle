using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.Models;

public class Friendship
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public long FriendId { get; set; }
    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public User Friend { get; set; } = null!;
}