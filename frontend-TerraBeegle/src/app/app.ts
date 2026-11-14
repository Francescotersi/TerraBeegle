import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BackgroundComponent } from './ui/background/background.component';
import { HeaderComponent } from './views/header/header.component';
import { AlertComponent } from './ui/alert/alert.component';
import { ReviewPopupComponent } from './ui/review-popup/review-popup.component';
import { GridGameActionsService } from './views/grid/services/grid-game-actions.service';

@Component({
	imports: [RouterOutlet, HeaderComponent, AlertComponent, BackgroundComponent, ReviewPopupComponent],
	standalone: true,
	selector: 'app-root',
	template: `
		<app-background />

		<app-alert />

		<app-header />

		<main class="w-100 py-4 content">
			<router-outlet />
		</main>

		<app-review-popup
			[isOpen]="actions.pendingReview() !== null"
			[gameName]="actions.pendingReview()?.gameName ?? 'Game'"
			[isSubmitting]="actions.isPublishingReview()"
			(closed)="actions.cancelReview()"
			(published)="actions.publishReview($event)"
		/>
	`,
	styles: `
		.content {
    		position: relative;
    	}
	`,
})
export class App {
	protected readonly actions = inject(GridGameActionsService);
}
