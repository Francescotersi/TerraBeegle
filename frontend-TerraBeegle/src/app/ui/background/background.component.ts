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
			background-color: var(--tb-bg);
			overflow: hidden;
			transition: background-color 0.4s ease;
		}

		.glow-effect {
			width: 100%;
			height: 100%;
			background: radial-gradient(circle at 50% 15%, var(--tb-accent-glow), transparent 70%);
		}

		.moving-ball {
			position: absolute;
			top: 10%;
			left: 10%;
			width: 320px;
			height: 320px;
			border-radius: 50%;
			background: var(--tb-ball-1);
			box-shadow: 0 0 28px 8px var(--tb-accent-glow);
			will-change: transform;
			animation: move-ball 12s linear infinite alternate;
			transition: background-color 0.4s ease;
		}

		.ball-2 { animation-delay: -2s; background: var(--tb-ball-2); }
		.ball-3 { animation-delay: -4s; background: var(--tb-ball-3); }
		.ball-4 { animation-delay: -6s; background: var(--tb-ball-4); }
		.ball-5 { animation-delay: -8s; background: var(--tb-ball-2); }
		.ball-6 { animation-delay: -10s; background: var(--tb-ball-1); }

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
