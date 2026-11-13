namespace Backend_TerraBeegle.Enums;

public enum GameType
{
    MainGame,
    DLC,
    Expansion,
    Bundle,
    StandaloneExpansion,
    Mod,
    Episode,
    Season,
    Remake,
    Remaster,
    ExpandedGame,
    Port,
    Fork,
    PackAddon,
    Update
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
    Romance = 44
}

public enum PegiRating
{
    PEGI3 = 8,
    PEGI7 = 9,
    PEGI12 = 10,
    PEGI16 = 11,
    PEGI18 = 12
}