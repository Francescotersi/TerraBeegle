import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReviewCreateDTO, ReviewResponseDTO, ReviewUpdateDTO } from '../models-services/review.model';

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

  // Reviews written by a user (GET /api/user/{username}/reviews)
  getUserReviews(
    username: string,
    page = 1,
    pageSize = 10,
    sortBy?: 'date' | 'rating',
    ascending?: boolean
  ): Observable<PagedReviewResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    if (sortBy) params = params.set('sortBy', sortBy);
    if (ascending !== undefined) params = params.set('ascending', String(ascending));
    return this.http.get<PagedReviewResponse>(`/api/user/${encodeURIComponent(username)}/reviews`, { params });
  }

  updateReview(gameId: number, payload: ReviewUpdateDTO): Observable<ReviewResponseDTO> {
    return this.http.patch<ReviewResponseDTO>(`/api/games/${gameId}/reviews`, payload);
  }

  deleteReview(gameId: number, reviewId: number): Observable<void> {
    return this.http.delete<void>(`/api/games/${gameId}/reviews/${reviewId}`);
  }
}
