CREATE TABLE IF NOT EXISTS users (
    id             BIGSERIAL PRIMARY KEY,
    name           VARCHAR(100) NOT NULL,
    family_name    VARCHAR(100) NOT NULL,
    email          VARCHAR(255) UNIQUE NOT NULL,
    image_profile  TEXT,
    username       VARCHAR(100) UNIQUE NOT NULL,
    theme          VARCHAR(20) NOT NULL DEFAULT 'light'
                   CHECK (theme IN ('light', 'dark')),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
