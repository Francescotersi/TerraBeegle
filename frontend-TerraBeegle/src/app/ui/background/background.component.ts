import { Component } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-background',
	template: `
		<div class="glow-effect"></div>

		<div class="moving-ball"></div>
		<div class="moving-ball ball-2"></div>
		<div class="moving-ball ball-3"></div>
		<div class="moving-ball ball-4"></div>
		<div class="moving-ball ball-5"></div>
		<div class="moving-ball ball-6"></div>
	`,
  styles: `
		:host {
			position: fixed;
			inset: 0;
			z-index: 0;
			pointer-events: none;
			background-color: #faf6fa;
			overflow: hidden;
		}

		.glow-effect {
			width: 100%;
			height: 100%;
			background: radial-gradient(circle at 50% 15%, rgba(244, 114, 182, 0.18), rgba(251, 146, 60, 0.08) 45%, transparent 70%);
		}

		.moving-ball {
			position: absolute;
			top: 10%;
			left: 10%;
			width: 320px;
			height: 320px;
			border-radius: 50%;
			background: #f472b6;
			box-shadow: 0 0 24px 8px rgba(244, 114, 182, 0.5);
			will-change: transform;
			animation: move-ball 12s linear infinite alternate;
		}

		.ball-2 { animation-delay: -2s; background: #a78bfa; box-shadow: 0 0 24px 8px rgba(167, 139, 250, 0.55); }
		.ball-3 { animation-delay: -4s; background: #fb7185; box-shadow: 0 0 24px 8px rgba(251, 113, 133, 0.55); }
		.ball-4 { animation-delay: -6s; background: #34d399; box-shadow: 0 0 24px 8px rgba(52, 211, 153, 0.55); }
		.ball-5 { animation-delay: -8s; background: #fbbf24; box-shadow: 0 0 24px 8px rgba(251, 191, 36, 0.55); }
		.ball-6 { animation-delay: -10s; background: #f472b6; box-shadow: 0 0 24px 8px rgba(244, 114, 182, 0.55); }

		@keyframes move-ball {
			0% { transform: translate(0, 0); }
			25% { transform: translate(70vw, 15vh); }
			50% { transform: translate(35vw, 70vh); }
			75% { transform: translate(-5vw, 45vh); }
			100% { transform: translate(75vw, 80vh); }
		}
  `
})
export class BackgroundComponent {}
