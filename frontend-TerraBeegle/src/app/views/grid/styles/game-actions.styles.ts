// Shared by the desktop card details and the mobile bottom sheet (wishlist / favorites / details buttons)
export const GAME_ACTIONS_STYLES = `
    .btn-action-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--tb-accent);
      background: var(--tb-glass-bg);
      color: var(--tb-accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      backdrop-filter: blur(4px);
      transition: all 0.2s ease;
    }

    .btn-action-circle:hover {
      background: var(--tb-accent);
      border-color: var(--tb-accent-hover);
      color: #ffffff;
      transform: scale(1.08);
      box-shadow: 0 0 10px var(--tb-accent-glow);
    }

    .btn-action-circle.is-active {
      background: var(--tb-accent);
      border-color: var(--tb-accent-hover);
      color: #ffffff;
      box-shadow: 0 0 10px var(--tb-accent-glow);
    }

    .btn-action-circle.btn-more {
      background: var(--tb-glass-bg);
      border-color: var(--tb-glass-border);
      color: var(--tb-text-muted);
    }

    .btn-action-circle.btn-more:hover {
      background: var(--tb-accent);
      border-color: var(--tb-accent);
      color: #ffffff;
      transform: scale(1.08);
    }

    .heart-container {
      --heart-color: var(--tb-accent);
      position: relative;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 1px solid var(--tb-accent);
      background: var(--tb-glass-bg);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      cursor: pointer;
      transition: all 0.2s ease;
      box-sizing: border-box;
      flex-shrink: 0;
    }

    .heart-container:hover {
      background: var(--tb-accent-subtle);
      border-color: var(--tb-accent-hover);
      transform: scale(1.08);
      box-shadow: 0 0 10px var(--tb-accent-glow);
    }

    .heart-container.is-active {
      background: var(--tb-accent-subtle);
      border-color: var(--tb-accent-hover);
      box-shadow: 0 0 10px var(--tb-accent-glow);
    }

    .heart-container:focus-visible {
      outline: 2px solid var(--tb-accent);
      outline-offset: 2px;
    }

    .heart-container .svg-container {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      pointer-events: none;
    }

    .heart-container .svg-outline,
    .heart-container .svg-filled {
      fill: var(--heart-color);
      position: absolute;
      width: 15px;
      height: 15px;
      pointer-events: none;
      transition: fill 0.2s ease;
    }

    .heart-container .svg-filled {
      animation: keyframes-svg-filled 0.75s ease;
      display: none;
    }

    .heart-container .svg-celebrate {
      position: absolute;
      width: 38px;
      height: 38px;
      animation: keyframes-svg-celebrate 0.5s ease-out;
      animation-fill-mode: forwards;
      display: block;
      stroke: var(--heart-color);
      fill: var(--heart-color);
      stroke-width: 2px;
      pointer-events: none;
      overflow: visible;
    }

    .heart-container.is-active .svg-filled {
      display: block;
    }

    .heart-container.is-active .svg-outline {
      display: none;
    }

    @keyframes keyframes-svg-filled {
      0% {
        transform: scale(0);
      }
      30% {
        transform: scale(1.25);
      }
      60% {
        transform: scale(0.92);
        filter: brightness(1.3);
      }
      100% {
        transform: scale(1);
        filter: brightness(1);
      }
    }

    @keyframes keyframes-svg-celebrate {
      0% {
        transform: scale(0);
        opacity: 1;
      }
      50% {
        opacity: 1;
        filter: brightness(1.4);
      }
      100% {
        transform: scale(1.4);
        opacity: 0;
        display: none;
      }
    }
`;
