using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.DTOS;

public record FriendshipCreateDTO
{
    public long SenderId { get; init; }
    public long ReceiverId { get; init; }
}

public record FriendshipUpdateDTO
{
    public long Id { get; init; }
    public long SenderId { get; init; }
    public long ReceiverId { get; init; }
    public FriendshipStatus Status { get; init; }
}

public record FriendshipResponseDTO
{
    public long Id { get; init; }
    public long SenderId { get; init; }
    public long ReceiverId { get; init; }
    public string Status { get; init; } = null!;
    public DateTime UpdatedAt { get; init; }
    public UserPublicResponseDTO User { get; init; } = null!;  // The user not the logged in: the friend, the receiver or the sender
}