-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    family_name    VARCHAR(100) NOT NULL,
    email          VARCHAR(255) UNIQUE NOT NULL,
    image_profile  TEXT,
    username       VARCHAR(100) UNIQUE NOT NULL,
    password       
    theme          VARCHAR(20) NOT NULL DEFAULT 'light'
    CHECK (theme IN ('light', 'dark')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. GAMES
-- rawg_game_id = Game ID from RAWG API
CREATE TABLE IF NOT EXISTS games (
    id               BIGSERIAL PRIMARY KEY,
    rawg_game_id     INTEGER UNIQUE NOT NULL,
    title            VARCHAR(255) NOT NULL,
    slug             VARCHAR(255),
    description      TEXT,
    cover_image_url  TEXT,
    release_date     DATE,
    rating           NUMERIC(4,2),
    metacritic       INTEGER,
    developer        VARCHAR(255),
    publisher        VARCHAR(255),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_rawg_game_id
    ON games(rawg_game_id);

CREATE INDEX IF NOT EXISTS idx_games_title
    ON games(title);

-- 3. FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id   BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user
    ON favorites(user_id);

CREATE INDEX IF NOT EXISTS idx_favorites_game
    ON favorites(game_id);

-- 4. WISHLIST
CREATE TABLE IF NOT EXISTS wishlist_items (
    id        BIGSERIAL PRIMARY KEY,
    user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id   BIGINT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    added_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, game_id)
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user
    ON wishlist_items(user_id);

CREATE INDEX IF NOT EXISTS idx_wishlist_game
    ON wishlist_items(game_id);