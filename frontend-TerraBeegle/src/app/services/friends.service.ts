import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { AlertService } from './alert.service';
import { FriendshipResponseDTO, FriendshipUpdateDTO, PagedResponse } from '../models/friendship.model';
import { UserPublicResponseDTO } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  private readonly baseUrl = '/api/users/friendship';
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly alertService = inject(AlertService);

  getFriends(page: number = 1, pageSize: number = 20): Observable<PagedResponse<FriendshipResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResponse<FriendshipResponseDTO>>(`${this.baseUrl}/friends`, { params });
  }

  getReceivedRequests(page: number = 1, pageSize: number = 20): Observable<PagedResponse<FriendshipResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResponse<FriendshipResponseDTO>>(`${this.baseUrl}/received`, { params });
  }

  getSentRequests(page: number = 1, pageSize: number = 20): Observable<PagedResponse<FriendshipResponseDTO>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResponse<FriendshipResponseDTO>>(`${this.baseUrl}/sent`, { params });
  }

  searchUsers(username: string, pageSize: number = 5): Observable<PagedResponse<UserPublicResponseDTO>> {
    const cleanTerm = username.trim().replace(/^@/, '');
    const params = new HttpParams()
      .set('username', cleanTerm)
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResponse<UserPublicResponseDTO>>('/api/users/search', { params });
  }

  getUserByUsername(username: string): Observable<UserPublicResponseDTO> {
    const cleanUsername = username.trim().replace(/^@/, '');
    return this.http.get<UserPublicResponseDTO>(`/api/users/${encodeURIComponent(cleanUsername)}`);
  }

  sendRequest(receiverId: number): Observable<FriendshipResponseDTO> {
    const senderId = this.authService.currentUser()?.id;
    if (!senderId) {
      this.alertService.showAlert('Please log in to send a friend request.');
      return throwError(() => new Error('User not authenticated'));
    }

    if (senderId === receiverId) {
      this.alertService.showAlert('You cannot add yourself as a friend.');
      return throwError(() => new Error('Cannot add oneself'));
    }

    const payload = { senderId, receiverId };
    return this.http.post<FriendshipResponseDTO>(this.baseUrl, payload);
  }

  sendRequestByUsername(username: string): Observable<FriendshipResponseDTO> {
    return this.getUserByUsername(username).pipe(
      switchMap((user) => this.sendRequest(user.id))
    );
  }

  acceptRequest(friendship: FriendshipResponseDTO): Observable<FriendshipResponseDTO> {
    const payload: FriendshipUpdateDTO = {
      id: friendship.id,
      senderId: friendship.senderId,
      receiverId: friendship.receiverId,
      status: 'Accepted',
    };
    return this.http.patch<FriendshipResponseDTO>(this.baseUrl, payload);
  }

  rejectRequest(friendship: FriendshipResponseDTO): Observable<FriendshipResponseDTO> {
    const payload: FriendshipUpdateDTO = {
      id: friendship.id,
      senderId: friendship.senderId,
      receiverId: friendship.receiverId,
      status: 'Rejected',
    };
    return this.http.patch<FriendshipResponseDTO>(this.baseUrl, payload);
  }

  deleteFriendship(friendshipId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${friendshipId}`);
  }
}
