// Shared by every section of the game details page (chips, section titles, facts list, buttons)
export const GAME_DETAILS_STYLES = `
    :host {
      display: block;
      color: var(--tb-text);
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 0.9rem;
    }

    .type-chip,
    .chip,
    .platform-chip,
    .link-chip {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      border: 1px solid var(--tb-glass-border);
      background: var(--tb-glass-inner-bg);
      color: var(--tb-text);
      font-weight: 600;
      line-height: 1;
    }
    .type-chip {
      padding: 4px 10px;
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--tb-accent);
    }
    .chip {
      padding: 6px 12px;
      font-size: 0.8rem;
    }
    .platform-chip {
      padding: 4px 9px;
      font-size: 0.74rem;
    }
    .link-chip {
      padding: 7px 13px;
      font-size: 0.82rem;
      text-decoration: none;
      transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
    }
    .link-chip:hover {
      border-color: var(--tb-accent);
      color: var(--tb-accent);
      transform: translateY(-1px);
    }

    /* Two columns: label on the left, value on the right */
    .facts {
      display: grid;
      grid-template-columns: max-content 1fr;
      gap: 6px 16px;
      font-size: 0.9rem;
    }
    .facts dt {
      color: var(--tb-text-muted);
      font-weight: 600;
    }
    .facts dd {
      margin: 0;
      min-width: 0;
    }

    /* Same gradient buttons as "Show More" */
    .btn-gradient,
    .btn-glass {
      border-radius: 20px;
      padding: 0.45rem 1.1rem;
      font-weight: 600;
      font-size: 0.9rem;
      transition: all 0.2s ease;
    }
    .btn-gradient {
      background: var(--tb-btn-gradient);
      border: 1px solid var(--tb-glass-border);
      color: #fff;
      box-shadow: 0 2px 10px var(--tb-btn-gradient-shadow);
    }
    .btn-gradient:hover {
      background: var(--tb-btn-gradient-hover);
      box-shadow: 0 4px 16px var(--tb-btn-gradient-shadow);
      transform: translateY(-2px);
      color: #fff;
    }
    .btn-glass {
      background: var(--tb-glass-inner-bg);
      border: 1px solid var(--tb-glass-border);
      color: var(--tb-text);
    }
    .btn-glass:hover,
    .btn-glass.is-active {
      border-color: var(--tb-accent);
      color: var(--tb-accent);
      transform: translateY(-2px);
    }
`;
