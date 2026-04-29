import { HttpClient, HttpHeaders } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, take, tap } from 'rxjs';

import { APP_ENVIRONMENT } from '../models/app-environment';
import { JwtPayload, LoginRequest, SignupRequest } from '../models/auth.models';
import { WampService } from './wamp.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly httpClient = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly wampService = inject(WampService);

  private readonly jwtStorageKey = 'jwt_token';
  private readonly jwtToken = signal<string | null>(null);
  private readonly authState = signal<'checking' | 'authenticated' | 'anonymous'>('checking');

  readonly token = this.jwtToken.asReadonly();
  readonly state = this.authState.asReadonly();
  readonly isAuthenticated = computed(() => this.jwtToken() !== null);
  readonly user = computed(() => this.decodePayload(this.jwtToken())?.sub ?? null);

  restoreSession(): void {
    if (this.authState() !== 'checking' && this.jwtToken()) {
      return;
    }

    const jwt = localStorage.getItem(this.jwtStorageKey);

    if (!jwt || this.isTokenExpired(jwt)) {
      this.clearSession(false);
      return;
    }

    this.jwtToken.set(jwt);
    this.authState.set('authenticated');

    this.httpClient
      .get(`${APP_ENVIRONMENT.httpBaseUrl}/authenticate`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${jwt}` }),
      })
      .pipe(take(1))
      .subscribe({
        next: () => this.authState.set('authenticated'),
        error: () => this.clearSession(true),
      });
  }

  login(request: LoginRequest): Observable<void> {
    return this.httpClient
      .post(`${APP_ENVIRONMENT.httpBaseUrl}/login`, request, { responseType: 'text' })
      .pipe(
        tap((jwt) => this.setSession(jwt)),
        map(() => void 0),
      );
  }

  signup(request: SignupRequest): Observable<'ok' | 'exists'> {
    return this.httpClient
      .post(`${APP_ENVIRONMENT.httpBaseUrl}/signup`, request, { responseType: 'text' })
      .pipe(
        map((jwt) => {
          if (jwt === 'EXISTS') {
            return 'exists' as const;
          }

          this.setSession(jwt);
          return 'ok' as const;
        }),
      );
  }

  logout(options: { redirect?: boolean } = {}): void {
    this.clearSession(options.redirect ?? true);
  }

  private setSession(jwt: string): void {
    localStorage.setItem(this.jwtStorageKey, jwt);
    this.jwtToken.set(jwt);
    this.authState.set('authenticated');
  }

  private clearSession(redirect: boolean): void {
    localStorage.removeItem(this.jwtStorageKey);
    this.jwtToken.set(null);
    this.authState.set('anonymous');
    this.wampService.disconnect();

    if (redirect) {
      queueMicrotask(() => {
        void this.router.navigateByUrl('/login');
      });
    }
  }

  private isTokenExpired(jwt: string): boolean {
    const exp = this.decodePayload(jwt)?.exp;

    return !exp || exp * 1000 <= Date.now();
  }

  private decodePayload(jwt: string | null): JwtPayload | null {
    if (!jwt) {
      return null;
    }

    const segments = jwt.split('.');

    if (segments.length < 2) {
      return null;
    }

    try {
      const payload = segments[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(segments[1].length / 4) * 4, '=');

      return JSON.parse(atob(payload)) as JwtPayload;
    } catch {
      return null;
    }
  }
}
