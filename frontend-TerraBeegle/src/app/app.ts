import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';

export interface HealthInfo {
  status: string;
  framework: string;
  database: string;
  timestamp: string;
}

export interface ChallengeItem {
  id: number;
  title: string;
  description: string;
  isCompleted: boolean;
  createdAt: string;
}

@Component({
  imports: [CommonModule, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private http = inject(HttpClient);

  protected readonly title = signal('TerraBeegle');
  protected readonly health = signal<HealthInfo | null>(null);
  protected readonly challenges = signal<ChallengeItem[]>([]);
  protected readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.checkHealth();
    this.loadChallenges();
  }

  checkHealth(): void {
    this.http.get<HealthInfo>('/api/health').subscribe({
      next: (data) => this.health.set(data),
      error: () => this.health.set(null),
    });
  }

  loadChallenges(): void {
    this.http.get<ChallengeItem[]>('/api/challenges').subscribe({
      next: (data) => {
        this.challenges.set(data);
        this.error.set(null);
      },
      error: () => {
        this.error.set('Backend offline o irraggiungibile su /api/challenges. Avvia il backend .NET 10 per testare la connessione.');
      },
    });
  }
}
