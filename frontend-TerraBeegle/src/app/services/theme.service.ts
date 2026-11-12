import { signal, Injectable, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Theme } from '../models-services/user.model';

export type { Theme };

@Injectable({
	providedIn: 'root',
})
export class ThemeService {
	private readonly platformId = inject(PLATFORM_ID);
	private readonly STORAGE_KEY = 'theme';
	readonly currentTheme = signal<Theme>(this.getInitialTheme());

	constructor() {
		effect(() => {
			const theme = this.currentTheme();
			if (isPlatformBrowser(this.platformId)) {
				document.documentElement.setAttribute('data-bs-theme', theme);
				localStorage.setItem(this.STORAGE_KEY, theme);
				this.updateFavicon(theme);
			}
		});
	}

	toggleTheme(): void {
		this.currentTheme.set(this.currentTheme() === 'light' ? 'dark' : 'light');
	}
	
	setTheme(theme: Theme): void {
		this.currentTheme.set(theme);
	}

	private updateFavicon(theme: Theme): void {
		const targetHref = theme === 'dark' ? 'Logo-dark.ico' : 'Logo.ico';
		let favicon = (document.getElementById('app-favicon') as HTMLLinkElement | null)
			?? document.querySelector<HTMLLinkElement>("link[rel~='icon']");

		if (favicon) {
			favicon.href = targetHref;
		} else {
			favicon = document.createElement('link');
			favicon.id = 'app-favicon';
			favicon.rel = 'icon';
			favicon.type = 'image/x-icon';
			favicon.href = targetHref;
			document.head.appendChild(favicon);
		}
	}

	private getInitialTheme(): Theme {
		if (!isPlatformBrowser(this.platformId)) {
			return 'light';
		}
		const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
		if (saved === 'light' || saved === 'dark') {
			return saved;
		}
		return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: 'light';
	}
}