import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackgroundComponent } from './ui/background/background.component';
import { HeaderComponent } from './header/header.component';

@Component({
	imports: [RouterOutlet, BackgroundComponent, HeaderComponent],
	standalone: true,
	selector: 'app-root',
	template: `
		<app-background />

		<app-header />

		<main class="container py-4 content">
			<router-outlet />
		</main>
	`,
	styles: `
		.content {
    		position: relative;
    		z-index: 1;
    	}
	`,
})
export class App {}
