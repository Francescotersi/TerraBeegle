namespace Backend_TerraBeegle.RateLimiting;

public static class RateLimitPolicies
{
    public const string Login = "login";
    public const string Register = "register";
    public const string ResendEmail = "resend-email";
    public const string ForgotPasswordRequest = "forgot-password-request";
    public const string ForgotPassword = "forgot-password";
    public const string ChangeEmail = "change-email";
    public const string ConfirmEmail = "confirm-email";
    public const string ChangePassword = "change-password";
    public const string UserWrite = "user-write";
    public const string UserGames = "user-games";
}