import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewCreateDTO, ReviewResponseDTO } from '../models-services/review.model';

export interface PagedReviewResponse {
  items: ReviewResponseDTO[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  previousPageUrl: string | null;
  nextPageUrl: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private readonly http = inject(HttpClient);

  createReview(gameId: number, payload: ReviewCreateDTO): Observable<ReviewResponseDTO> {
    return this.http.post<ReviewResponseDTO>(`/api/games/${gameId}/reviews`, payload);
  }

  getGameReviews(gameId: number, page = 1, pageSize = 10): Observable<PagedReviewResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedReviewResponse>(`/api/games/${gameId}/reviews`, { params });
  }
}
