using Backend_TerraBeegle.Enums;

namespace Backend_TerraBeegle.DTOS;

public class FriendshipDTO
{
    public long Id { get; set; }
    public long User1Id { get; set; }
    public long User2Id { get; set; }
    public long ReceiverId { get; set; }
    public FriendshipStatus Status { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class FriendshipRequestDTO
{
    public long SenderId { get; set; }
    public long ReceiverId { get; set; }
}

public class FriendshipResponseDTO
{
    public long Id { get; set; }
    public long SenderId { get; set; }
    public long ReceiverId { get; set; }
    public string Status { get; set; } = null!;
    public DateTime UpdatedAt { get; set; }
}

public class FriendsListDTO
{
    public IEnumerable<FriendshipResponseDTO> Friends { get; set; } = null!;
    public IEnumerable<FriendshipResponseDTO> FriendshipsSent { get; set; } = null!;
    public IEnumerable<FriendshipResponseDTO> FriendshipsReceived { get; set; } = null!;
}