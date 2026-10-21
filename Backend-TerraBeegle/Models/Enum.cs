namespace Backend_TerraBeegle.Models;

public enum Theme
{
    Light,
    Dark
}

public enum UserStatus
{
    Online,
    Offline,
    Away,
    Busy
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
    PC,
    PlayStation,
    Xbox,
    NintendoSwitch,
    Mobile
}

public enum GameStatus
{
    NotStarted,
    Playing,
    Completed,
    Abandoned
}