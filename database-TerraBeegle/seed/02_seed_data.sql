INSERT INTO users (name, family_name, email, image_profile, username, theme)
VALUES ('test', 'test', 'test@example.com', 'https://example.com/avatar.png', 'test', 'dark');

INSERT INTO games (
    rawg_game_id, title, slug, description, cover_image_url,
    release_date, rating, metacritic, developer, publisher
)
VALUES (
    3498,
    'Grand Theft Auto V',
    'grand-theft-auto-v',
    'An open-world action-adventure game.',
    'https://example.com/gta5.jpg',
    '2013-09-17',
    4.47,
    96,
    'Rockstar North',
    'Rockstar Games'
);

INSERT INTO favorites (user_id, game_id)
VALUES (1, 1);

INSERT INTO wishlist_items (user_id, game_id)
VALUES (1, 1);