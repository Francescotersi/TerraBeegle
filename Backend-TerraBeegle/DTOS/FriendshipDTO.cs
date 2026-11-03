using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.DTOS;

public class FriendshipRequestDTO
{
    public long SenderId { get; set; }
    public long ReceiverId { get; set; }
}

public class FriendshipRequestUpdateDTO
{
    public long Id { get; set; }
    public long SenderId { get; set; }
    public long ReceiverId { get; set; }
    public FriendshipStatus Status { get; set; }
}

public class FriendshipResponseDTO
{
    public long Id { get; set; }
    public long SenderId { get; set; }
    public long ReceiverId { get; set; }
    public string Status { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
    public UserPublicResponseDTO User { get; set; } = null!;  // The user not the logged in: the friend, the receiver or the sender
}