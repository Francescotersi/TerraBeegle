using System.Security.Cryptography;
using System.Text;

namespace Backend_TerraBeegle.Services;

public static class SecureCode
{
    private const string Characters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private const int Length = 8;

    public static string Generate() => RandomNumberGenerator.GetString(Characters, Length);

    public static string Hash(string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code.Trim().ToUpperInvariant())));

    public static bool Matches(string expectedHash, string code) =>
        CryptographicOperations.FixedTimeEquals(
            Convert.FromHexString(expectedHash),
            Convert.FromHexString(Hash(code)));
}
