namespace Backend_TerraBeegle.Services;

public interface IEmailService
{
    // Sends an email
    Task SendAsync(string to, string subject, string body);
}
