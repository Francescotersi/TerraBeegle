using System.Security.Cryptography;
using System.Text;

namespace Backend_TerraBeegle.Services;

public static class SecureCode
{
    private const string Characters = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private const int Length = 8;

    // Generates a random 8-character code
    public static string Generate() => RandomNumberGenerator.GetString(Characters, Length);

    // Hashes a code with SHA256 (case and spaces ignored)
    public static string Hash(string code) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(code.Trim().ToUpperInvariant())));

    // Compares a code with a stored hash in constant time
    public static bool Matches(string expectedHash, string code) =>
        CryptographicOperations.FixedTimeEquals(
            Convert.FromHexString(expectedHash),
            Convert.FromHexString(Hash(code)));
}
