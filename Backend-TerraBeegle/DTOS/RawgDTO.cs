namespace Backend_TerraBeegle.DTOS;

public class RawgResponseDTO
{
    public int id;
    public string slug = null!;
    public string name = null!;
    public string name_original = null!;
    public string description = null!;
    public int? metacritic;
    public string? released;
    public bool tba;
    public string? background_image;
    public double rating;
    public string website = null!;
    public IEnumerable<RawgPlatformListDTO> platforms = null!;
}

public class RawgPlatformListDTO
{
    public string name = null!;
}

public class RawgPlatformDTO
{
    public int id;
    public string name = null!;
}