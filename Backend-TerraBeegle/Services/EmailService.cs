using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Backend_TerraBeegle.Services;

// sends the emails through the SMTP server from the smtp settings (gmail with an app password)
public class EmailService(IConfiguration config) : IEmailService
{
    public async Task SendAsync(string to, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress("TerraBeegle", config["Smtp:From"]!));
        message.To.Add(MailboxAddress.Parse(to));
        message.Subject = subject;
        message.Body = new TextPart("plain") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(config["Smtp:Host"]!, config.GetValue<int>("Smtp:Port"), SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(config["Smtp:User"]!, config["Smtp:Password"]!);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
