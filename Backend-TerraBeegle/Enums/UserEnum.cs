namespace Backend_TerraBeegle.Enums;

public enum UserTheme
{
    Light,
    Dark
}

public enum CodeVerificationResult
{
    Valid,
    Invalid,
    Expired,
    TooManyAttempts
}

public enum EmailCodePurpose
{
    Register,
    ResendVerification,
    ForgotPassword,
    ChangeEmail,
    TwoFactorLogin
}