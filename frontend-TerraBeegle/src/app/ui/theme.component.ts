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
      display: inline-flex;
      align-items: center;
      position: relative;
      width: 62px;
      height: 32px;
      border-radius: 32px;
      cursor: pointer;
      margin: 0;
      outline: none;
      background: linear-gradient(135deg, #071F49 0%, #0c1c38 100%);
      border: 1.5px solid rgba(46, 217, 231, 0.35);
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.35);
      transition: background 0.35s ease, border-color 0.35s ease, transform 0.15s ease;
      user-select: none;
    }

    .switch-name:active {
      transform: scale(0.96);
    }

    .switch-name:focus-visible {
      outline: 2px solid var(--tb-accent);
      box-shadow: none;
    }

    /* Stile Light Mode (cielo diurno tenue, senza rosa aggressivo) */
    .switch-name.checked,
    .switch-name:has(.checkbox:checked) {
      background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%);
      border-color: rgba(125, 211, 252, 0.7);
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
    }

    /* Dischetto / Slider Knob che scorre in modo fluido */
    .switch-name .back {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 25px;
      height: 25px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.12);
      border: 1px solid rgba(46, 217, 231, 0.35);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
      transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1),
                  background-color 0.35s ease,
                  border-color 0.35s ease,
                  box-shadow 0.35s ease;
      pointer-events: none;
    }

    .switch-name.checked .back,
    .switch-name:has(.checkbox:checked) .back {
      transform: translateX(30px);
      background: #ffffff;
      border-color: rgba(0, 0, 0, 0.06);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
    }

    .switch-name .checkbox {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    /* Icone animate sincronizzate con lo scorrimento del dischetto */
    .switch-name .moon,
    .switch-name .sun {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 25px;
      height: 25px;
      padding: 4.5px;
      pointer-events: none;
      transition: transform 0.35s cubic-bezier(0.25, 1, 0.5, 1),
                  opacity 0.25s ease,
                  fill 0.3s ease;
    }

    /* Luna: attiva in Dark Mode a sinistra */
    .switch-name .moon {
      fill: #2ED9E7;
      opacity: 1;
      transform: translateX(0) scale(1) rotate(0deg);
    }

    .switch-name.checked .moon,
    .switch-name:has(.checkbox:checked) .moon {
      opacity: 0;
      transform: translateX(30px) scale(0.6) rotate(35deg);
    }

    /* Sole: attivo in Light Mode a destra con oro caldo ambrato */
    .switch-name .sun {
      fill: #f59e0b;
      opacity: 0;
      transform: translateX(0) scale(0.6) rotate(-35deg);
    }

    .switch-name.checked .sun,
    .switch-name:has(.checkbox:checked) .sun {
      opacity: 1;
      transform: translateX(30px) scale(1) rotate(0deg);
    }
  `
})
export class ThemeSwitchComponent {
  readonly themeService = inject(ThemeService);
}
