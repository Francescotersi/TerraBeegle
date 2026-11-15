/** Shared styles for game details sections (chips, facts list, buttons, carousels). */
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

    .carousel-wrapper {
      position: relative;
    }
    .carousel-track {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      scroll-behavior: smooth;
      scroll-snap-type: x mandatory;
      scrollbar-width: none;
      padding: 2px 0;
    }
    .carousel-track::-webkit-scrollbar {
      display: none;
    }
    .carousel-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      z-index: 2;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1.5px solid rgba(255, 255, 255, 0.45);
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(10px);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 1;
      transition:
        opacity 0.24s cubic-bezier(0.22, 1, 0.36, 1),
        transform 0.24s cubic-bezier(0.22, 1, 0.36, 1),
        background-color 0.2s ease,
        border-color 0.2s ease;
    }
    .carousel-btn svg {
      transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .carousel-btn:hover {
      background: rgba(15, 23, 42, 0.94);
      border-color: var(--tb-accent);
    }
    .carousel-btn.prev:hover svg {
      transform: translateX(-2px);
    }
    .carousel-btn.next:hover svg {
      transform: translateX(2px);
    }
    .carousel-btn:active {
      transform: translateY(-50%) scale(0.94);
    }
    .carousel-btn.is-hidden {
      opacity: 0;
      transform: translateY(-50%) scale(0.86);
      pointer-events: none;
    }
    .carousel-btn.prev {
      left: 8px;
    }
    .carousel-btn.next {
      right: 8px;
    }
`;
