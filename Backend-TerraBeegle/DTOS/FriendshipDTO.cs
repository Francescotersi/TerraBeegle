namespace Backend_TerraBeegle.DTOS;

public class FriendshipDTO
{
    public long SenderId { get; set; }
    public long ReceiverId { get; set; }
    public string Status { get; set; } = null!;
}

public class FriendshipRequestDTO
{
    public long SenderId { get; set; }
    public long ReceiverId { get; set; }
}

public class FriendshipResponseDTO
{
    public long Id { get; set; }
    public long User1Id { get; set; }
    public long User2Id { get; set; }
    public long ReceiverId { get; set; }
    public string Status { get; set; } = null!;
}

public class FriendsListDTO
{
    public IEnumerable<FriendshipDTO> Friends { get; set; } = null!;
    public IEnumerable<FriendshipDTO> FriendshipsSent { get; set; } = null!;
    public IEnumerable<FriendshipDTO> FriendshipsReceived { get; set; } = null!;
}