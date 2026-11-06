namespace Backend_TerraBeegle.Enums;

public enum Theme
{
    Light,
    Dark
}

public enum FriendshipStatus
{
    Pending,
    Accepted,
    Rejected
}

public enum GameGenre
{
    PointAndClick = 2,
    Fighting = 4,
    Shooter = 5,
    Music = 7,
    Platform = 8,
    Puzzle = 9,
    Racing = 10,
    RealTimeStrategy = 11,
    RolePlaying = 12,
    Simulator = 13,
    Sport = 14,
    Strategy = 15,
    TurnBasedStrategy = 16,
    Tactical = 24,
    HackAndSlash = 25,
    QuizTrivia = 26,
    Pinball = 30,
    Adventure = 31,
    Indie = 32,
    Arcade = 33,
    VisualNovel = 34,
    CardAndBoardGame = 35,
    MOBA = 36
}

public enum GameTheme
{
    Drama = 31,
    NonFiction = 32,
    Sandbox = 33,
    Educational = 34,
    Kids = 35,
    OpenWorld = 38,
    Warfare = 39,
    Party = 40,
    _4X = 41,
    Erotic = 42,
    Mystery = 43,
    Action = 1,
    Fantasy = 17,
    ScienceFiction = 18,
    Horror = 19,
    Thriller = 20,
    Survival = 21,
    Historical = 22,
    Stealth = 23,
    Comedy = 27,
    Business = 28,
    Romance = 44
}

public enum GameParentPlatform
{
    PC = 1,
    PlayStation = 2,
    Xbox = 3,
    iOS = 4,
    Android = 8,
    AppleMacintosh = 5,
    Linux = 6,
    Nintendo = 7,
    Atari = 9,
    CommodoreAmiga = 10,
    SEGA = 11,
    _3DO = 12,
    NeoGeo = 13,
    Web = 14
}

public enum GamePlatform
{
    _3DO = 111,
    Android = 21,
    AppleII = 41,
    Atari2600 = 23,
    Atari5200 = 31,
    Atari7800 = 28,
    Atari8bit = 25,
    AtariFlashback = 22,
    AtariLynx = 46,
    AtariST = 34,
    AtariXEGS = 50,
    ClassicMacintosh = 55,
    CommodoreAmiga = 166,
    Dreamcast = 106,
    GameBoy = 26,
    GameBoyAdvance = 24,
    GameBoyColor = 43,
    GameCube = 105,
    GameGear = 77,
    Genesis = 167,
    iOS = 3,
    Jaguar = 112,
    Linux = 6,
    macOS = 5,
    NeoGeo = 12,
    NES = 49,
    Nintendo3DS = 8,
    Nintendo64 = 83,
    NintendoDS = 9,
    NintendoDSi = 13,
    NintendoSwitch = 7,
    PC = 4,
    PlayStation = 27,
    PlayStation2 = 15,
    PlayStation3 = 16,
    PlayStation4 = 18,
    PlayStation5 = 187,
    PSP = 17,
    PSVita = 19,
    SEGA32X = 117,
    SEGACD = 119,
    SEGAMasterSystem = 74,
    SEGASaturn = 107,
    SNES = 79,
    Web = 171,
    Wii = 11,
    WiiU = 10,
    Xbox = 80,
    Xbox360 = 14,
    XboxOne = 1,
    XboxSeriesSX = 186
}

public enum GameStore
{
    Steam = 1,
    XboxStore = 2,
    PlayStationStore = 3,
    AppStore = 4,
    GOG = 5,
    NintendoStore = 6,
    Xbox360Store = 7,
    GooglePlay = 8,
    ItchIO = 9,
    EpicGames = 11
}

public enum CodeVerificationResult
{
    Valid,
    Invalid,
    Expired,
    TooManyAttempts
}

// Why a code is sent: each one gets its own email text
public enum EmailCodePurpose
{
    Register,
    ResendVerification,
    ForgotPassword,
    ChangeEmail,
    TwoFactorLogin
}