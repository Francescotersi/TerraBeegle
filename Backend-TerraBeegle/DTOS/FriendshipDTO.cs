namespace Backend_TerraBeegle.DTOS;

public class FriendshipDTO
{
    public long User1Id { get; set; }
    public long User2Id { get; set; }
    public long ReceiverId { get; set; }
    public string Status { get; set; } = null!;
}