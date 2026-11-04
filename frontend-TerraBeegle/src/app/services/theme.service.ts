import { signal, Injectable, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

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
			}
		});
	}

	toggleTheme(): void {
		this.currentTheme.set(this.currentTheme() === 'light' ? 'dark' : 'light');
	}
	
	setTheme(theme: Theme): void {
		this.currentTheme.set(theme);
	}

	private getInitialTheme(): Theme {
		if (!isPlatformBrowser(this.platformId)) {
			return 'light';
		}
		const saved = localStorage.getItem(this.STORAGE_KEY) as Theme | null;
		if (saved === 'light' || saved === 'dark') {
			return saved;
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
}