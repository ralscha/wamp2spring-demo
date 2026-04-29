import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Position } from '../models/position.model';
import { Stationary } from '../models/stationary.model';

@Injectable({ providedIn: 'root' })
export class ServerPushService {
  private readonly httpClient = inject(HttpClient);
  private readonly serverUrl = environment.apiBaseUrl;

  async pushStationary(stationary: Stationary): Promise<void> {
    await this.post('/stationary', stationary);
  }

  async pushPosition(position: Position): Promise<void> {
    try {
      await this.post('/pos', position);
    } catch (error) {
      await this.pushError(this.describeError(error));
    }
  }

  async pushError(error: string): Promise<void> {
    try {
      await firstValueFrom(
        this.httpClient.post(`${this.serverUrl}/clienterror`, error, {
          headers: new HttpHeaders({ 'Content-Type': 'text/plain' }),
        }),
      );
    } catch (postError) {
      console.error('Unable to report client error.', postError);
    }
  }

  async clear(): Promise<void> {
    try {
      await firstValueFrom(this.httpClient.delete(`${this.serverUrl}/clear`));
    } catch (error) {
      await this.pushError(this.describeError(error));
    }
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  private async post(path: string, payload: Position | Stationary): Promise<void> {
    await firstValueFrom(this.httpClient.post(`${this.serverUrl}${path}`, payload));
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return typeof error === 'string' ? error : JSON.stringify(error);
  }
}
