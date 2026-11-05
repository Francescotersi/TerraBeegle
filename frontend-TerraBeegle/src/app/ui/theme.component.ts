import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

/**
 * Minimalist Theme Switch:
 * - Design ultra-pulito ed essenziale ispirato ai migliori minimal toggle di Uiverse.io.
 * - Light Mode: Pista soft neutra frosted, dischetto bianco puro e icona Sole minimale in ardesia scura (zero giallo, zero rosa).
 * - Dark Mode: Pista blu notte profondo (#071F49), dischetto scuro (#081226) e icona Luna minimale in Cyan (#2ED9E7).
 * - Transizione fluida e morbida con rotazione e crossfade delle icone vettoriali.
 */
@Component({
  selector: 'app-theme-switch',
  standalone: true,
  template: `
    <label
      class="theme-switch"
      [class.theme-switch--dark]="themeService.currentTheme() === 'dark'"
      [class.theme-switch--light]="themeService.currentTheme() === 'light'"
      (click)="$event.preventDefault(); themeService.toggleTheme()"
      role="button"
      tabindex="0"
      (keydown.enter)="$event.preventDefault(); themeService.toggleTheme()"
      (keydown.space)="$event.preventDefault(); themeService.toggleTheme()"
      [attr.aria-label]="themeService.currentTheme() === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'"
      [attr.title]="themeService.currentTheme() === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'"
    >
      <input
        type="checkbox"
        class="theme-switch__checkbox"
        [checked]="themeService.currentTheme() === 'dark'"
        tabindex="-1"
        aria-hidden="true"
        style="pointer-events: none;"
      />
      <div class="theme-switch__thumb">
        <!-- Icona Sole Minimale (Light Mode) in ardesia scura -->
        <svg
          class="theme-switch__icon theme-switch__icon--sun"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3.5" fill="currentColor"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>

        <!-- Icona Luna Minimale (Dark Mode) - Sagoma elegante e rifinita in Cyan (#2ED9E7) -->
        <svg
          class="theme-switch__icon theme-switch__icon--moon"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
          ></path>
        </svg>
      </div>
    </label>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      user-select: none;
    }

    .theme-switch {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 52px;
      height: 28px;
      padding: 2px;
      border-radius: 9999px;
      cursor: pointer;
      outline: none;
      user-select: none;
      -webkit-tap-highlight-color: transparent;

      /* Light mode: neutro, morbido e pulito */
      background: rgba(0, 0, 0, 0.07);
      border: 1px solid rgba(0, 0, 0, 0.08);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
      transition: background-color 0.3s ease, border-color 0.3s ease, transform 0.15s ease;
    }

    .theme-switch:active {
      transform: scale(0.96);
    }

    .theme-switch:focus-visible {
      outline: 2px solid var(--tb-accent);
    }

    /* Dark mode track: coordinata con #071F49 e bordo Cyan soft */
    .theme-switch--dark {
      background: #071F49;
      border-color: rgba(46, 217, 231, 0.3);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.4);
    }

    .theme-switch__checkbox {
      display: none;
    }

    /* Dischetto / Thumb scorrevole */
    .theme-switch__thumb {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: #ffffff;
      border: 1px solid rgba(0, 0, 0, 0.06);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
      transform: translateX(0);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                  background-color 0.3s ease,
                  border-color 0.3s ease,
                  box-shadow 0.3s ease;
    }

    .theme-switch--dark .theme-switch__thumb {
      transform: translateX(24px);
      background: #081226;
      border-color: rgba(46, 217, 231, 0.35);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
    }

    /* Icone vettoriali minimaliste con micro-rotazione e crossfade */
    .theme-switch__icon {
      position: absolute;
      width: 14px;
      height: 14px;
      transition: opacity 0.25s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Sole: ardesia sobrio (#334155), nessun giallo */
    .theme-switch__icon--sun {
      color: #334155;
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }

    .theme-switch--dark .theme-switch__icon--sun {
      opacity: 0;
      transform: rotate(90deg) scale(0.4);
    }

    /* Luna: sagoma pura Cyan (#2ED9E7), curvature morbide ed eleganti */
    .theme-switch__icon--moon {
      color: #2ED9E7;
      opacity: 0;
      transform: rotate(-30deg) scale(0.4);
    }

    .theme-switch--dark .theme-switch__icon--moon {
      opacity: 1;
      transform: rotate(0deg) scale(1);
    }
  `
})
export class ThemeSwitchComponent {
  readonly themeService = inject(ThemeService);
}
