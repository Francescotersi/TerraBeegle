// Shared by the desktop card details and the mobile bottom sheet (genres, rating, metacritic)
export const GAME_BADGES_STYLES = `
    .game-genres-line {
      font-size: 0.8rem;
      font-weight: 600;
      letter-spacing: 0.01em;
      color: var(--tb-text);
    }

    .metacritic-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 24px;
      padding: 0 5px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
      line-height: 1;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      user-select: none;
    }

    .meta-green {
      background-color: #00ce7a;
      color: #0f172a;
    }

    .meta-yellow {
      background-color: #ffcc33;
      color: #0f172a;
    }

    .meta-red {
      background-color: #ef4444;
      color: #ffffff;
    }

    .rating-box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      min-width: 28px;
      height: 24px;
      padding: 0 5px;
      border-radius: 6px;
      font-size: 0.78rem;
      font-weight: 800;
      line-height: 1;
      background-color: #ffcc33;
      color: #0f172a;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
      user-select: none;
    }
`;
