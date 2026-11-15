using Backend_TerraBeegle.DTOS;
using Backend_TerraBeegle.Models;
using Backend_TerraBeegle.Enums;
using Microsoft.EntityFrameworkCore;
using Backend_TerraBeegle.Data;
using IGDB.Models;
using IGDB;

namespace Backend_TerraBeegle.Services;

public static class SaveMedia
{
    public static async Task<Image?> GetOrCreateImageAsync(AppDbContext db, string? imageId, ImageType type)
    {
        if (string.IsNullOrWhiteSpace(imageId))
            return null;

        var existing = db.Images.Local.FirstOrDefault(i => i.ApiImageId == imageId)
            ?? await db.Images.FirstOrDefaultAsync(i => i.ApiImageId == imageId);

        if (existing is null)
        {
            existing = new Image { 
                ApiImageId = imageId,
                Type = type
            };
            db.Images.Add(existing);
        }

        return existing;
    }

    public static async Task<List<Image>> SaveImages(AppDbContext db, IEnumerable<Artwork>? artworks, Cover? cover, IEnumerable<Screenshot>? screenshots)
    {
        List<Image> images = [];

        if (await GetOrCreateImageAsync(db, cover?.ImageId, ImageType.Cover) is { } coverImg)
            images.Add(coverImg);

        if (artworks is not null)
        {
            foreach (var artwork in artworks)
            {
                if (await GetOrCreateImageAsync(db, artwork.ImageId, ImageType.Artwork) is { } artImg && !images.Contains(artImg))
                    images.Add(artImg);
            }
        }

        if (screenshots is not null)
        {
            foreach (var screenshot in screenshots)
            {
                if (await GetOrCreateImageAsync(db, screenshot.ImageId, ImageType.Screenshot) is { } scrImg && !images.Contains(scrImg))
                    images.Add(scrImg);
            }
        }

        return images;
    }

    public static async Task<List<Video>> SaveVideos(AppDbContext db, IEnumerable<GameVideo>? videos)
    {
        if (videos is null)
            return [];

        List<Video> videoList = [];

        foreach (var video in videos.Where(v => !string.IsNullOrWhiteSpace(v.VideoId)).DistinctBy(v => v.VideoId))
        {
            var existing = db.Videos.Local.FirstOrDefault(v => v.ApiVideoId == video.VideoId)
                ?? await db.Videos.FirstOrDefaultAsync(v => v.ApiVideoId == video.VideoId);

            if (existing is null)
            {
                existing = new Video
                {
                    ApiVideoId = video.VideoId!,
                    Name = video.Name ?? string.Empty
                };
                db.Videos.Add(existing);
            }
            videoList.Add(existing);
        }

        return videoList;
    }
}