namespace Backend_TerraBeegle.Models;

public enum Theme
{
    Light,
    Dark
}

public enum FriendshipStatus
{
    Pending,
    Accepted,
    Blocked
}

public enum GameGenre
{
    Action,
    Adventure,
    RPG,
    Strategy,
    Simulation,
    Sports,
    Puzzle,
    Racing,
    Fighting,
    Horror,
    Platformer,
    Shooter
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

public enum GameStatus
{
    NotStarted,
    Playing,
    Completed,
    Abandoned
}