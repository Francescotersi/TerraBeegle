namespace Backend_TerraBeegle.Enums;

public enum Theme
{
    Light,
    Dark
}

public enum DogCompanion
{
    Beagle,
    Elkhound,
    GoldenRetriever,
    Husky
}

public enum FriendshipStatus
{
    Pending,
    Accepted,
    Rejected
}

public enum GameGenre
{
    Action = 4,
    Adventure = 3,
    Arcade = 11,
    BoardGames = 28,
    Card = 17,
    Casual = 40,
    Educational = 34,
    Family = 19,
    Fighting = 6,
    Indie = 51,
    MassivelyMultiplayer = 59,
    Platformer = 83,
    Puzzle = 7,
    Racing = 1,
    RPG = 5,
    Shooter = 2,
    Simulation = 14,
    Sports = 15,
    Strategy = 10,
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

public enum EmailCodePurpose
{
    Register,
    ResendVerification,
    ForgotPassword,
    ChangeEmail,
    TwoFactorLogin
}