import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackgroundComponent } from './ui/background/background.component';
import { HeaderComponent } from './views/header/header.component';

@Component({
	imports: [RouterOutlet, BackgroundComponent, HeaderComponent],
	standalone: true,
	selector: 'app-root',
	template: `
		<app-background />

		<app-header />

		<main class="w-100 py-4 content">
			<router-outlet />
		</main>
	`,
	styles: `
		.content {
    		position: relative;
    	}
	`,
})
export class App {}
