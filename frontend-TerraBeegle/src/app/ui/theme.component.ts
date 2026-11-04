import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-switch',
  standalone: true,
  template: `
    <label
      class="switch-name"
      [class.checked]="themeService.currentTheme() === 'light'"
      [class.unchecked]="themeService.currentTheme() === 'dark'"
      (click)="$event.preventDefault(); themeService.toggleTheme()"
      role="button"
      tabindex="0"
      (keydown.enter)="$event.preventDefault(); themeService.toggleTheme()"
      (keydown.space)="$event.preventDefault(); themeService.toggleTheme()"
      [attr.aria-label]="themeService.currentTheme() === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'"
      [attr.title]="themeService.currentTheme() === 'dark' ? 'Passa alla modalità Chiara' : 'Passa alla modalità Scura'"
    >
      <input
        type="checkbox"
        class="checkbox"
        [checked]="themeService.currentTheme() === 'light'"
        tabindex="-1"
        aria-hidden="true"
        style="pointer-events: none;"
      />
      <div class="back"></div>
      <svg class="moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
        <path d="M223.5 32C100 32 0 132.3 0 256S100 480 223.5 480c60.6 0 115.5-24.2 155.8-63.4c5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6c-96.9 0-175.5-78.8-175.5-176c0-65.8 36-123.1 89.3-153.3c6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"></path>
      </svg>
      <svg class="sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
        <path d="M361.5 1.2c5 2.1 8.6 6.6 9.6 11.9L391 121l107.9 19.8c5.3 1 9.8 4.6 11.9 9.6s1.5 10.7-1.6 15.2L446.9 256l62.3 90.3c3.1 4.5 3.7 10.2 1.6 15.2s-6.6 8.6-11.9 9.6L391 391 371.1 498.9c-1 5.3-4.6 9.8-9.6 11.9s-10.7 1.5-15.2-1.6L256 446.9l-90.3 62.3c-4.5 3.1-10.2 3.7-15.2 1.6s-8.6-6.6-9.6-11.9L121 391 13.1 371.1c-5.3-1-9.8-4.6-11.9-9.6s-1.5-10.7 1.6-15.2L65.1 256 2.8 165.7c-3.1-4.5-3.7-10.2-1.6-15.2s6.6-8.6 11.9-9.6L121 121 140.9 13.1c1-5.3 4.6-9.8 9.6-11.9s10.7-1.5 15.2 1.6L256 65.1 346.3 2.8c4.5-3.1 10.2-3.7 15.2-1.6zM160 256a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zm224 0a128 128 0 1 0 -256 0 128 128 0 1 0 256 0z"></path>
      </svg>
    </label>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      user-select: none;
    }

    .switch-name {
      /* Colori coordinati con TerraBeegle */
      --dark-sky: #071F49;
      --moon: #2ED9E7;
      --moon-glow: rgba(46, 217, 231, 0.6);

      --light-sky-start: #fb7185;
      --light-sky-end: #f472b6;
      --sun: #FFE629;
      --sun-glow: rgba(255, 230, 41, 0.7);

      display: inline-block;
      position: relative;
      border-radius: 5em;
      cursor: pointer;
      width: 68px;
      height: 34px;
      overflow: hidden;
      margin: 0;
      border: 1.5px solid rgba(46, 217, 231, 0.35);
      box-shadow: 0 0 10px rgba(46, 217, 231, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.4);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), border-color 0.5s ease, box-shadow 0.5s ease;
      outline: none;
    }

    .switch-name:active {
      transform: scale(0.96);
    }

    .switch-name:focus-visible {
      box-shadow: 0 0 0 3px var(--tb-accent-glow);
    }

    /* Stile Light Mode */
    .switch-name.checked,
    .switch-name:has(.checkbox:checked) {
      border-color: rgba(255, 255, 255, 0.85);
      box-shadow: 0 3px 12px rgba(244, 114, 182, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.35);
    }

    /* Sfondo con transizione morbida tra i due gradienti */
    .switch-name .back {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      overflow: hidden;
    }

    .switch-name .back::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, #071F49 0%, #0a1733 100%);
      transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 1;
    }

    .switch-name .back::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--light-sky-start) 0%, var(--light-sky-end) 100%);
      transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      opacity: 0;
    }

    .switch-name.checked .back::before,
    .switch-name .checkbox:checked ~ .back::before {
      opacity: 0;
    }

    .switch-name.checked .back::after,
    .switch-name .checkbox:checked ~ .back::after {
      opacity: 1;
    }

    .switch-name .checkbox {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    /* Luna: animazione fluida di rotazione e traslazione */
    .switch-name .moon {
      position: absolute;
      left: 0;
      top: 0;
      width: 50%;
      height: 100%;
      padding: 0.42em;
      fill: var(--moon);
      filter: drop-shadow(0 0 4px var(--moon-glow));
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease;
      opacity: 1;
      transform: translate(0) rotate(0deg);
      pointer-events: none;
    }

    .switch-name.checked .moon,
    .switch-name .checkbox:checked ~ .moon {
      transform: translate(100%) rotate(180deg);
      opacity: 0;
    }

    /* Sole: animazione fluida di rotazione e traslazione */
    .switch-name .sun {
      position: absolute;
      left: 0;
      top: 0;
      width: 50%;
      height: 100%;
      padding: 0.42em;
      fill: var(--sun);
      filter: drop-shadow(0 0 5px var(--sun-glow));
      transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.45s ease;
      opacity: 0;
      transform: translate(0) rotate(0deg);
      pointer-events: none;
    }

    .switch-name.checked .sun,
    .switch-name .checkbox:checked ~ .sun {
      transform: translate(100%) rotate(180deg);
      opacity: 1;
    }
  `
})
export class ThemeSwitchComponent {
  readonly themeService = inject(ThemeService);
}
