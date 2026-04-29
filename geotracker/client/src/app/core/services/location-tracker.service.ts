import { Injectable, computed, inject, signal } from '@angular/core';

import { Position } from '../models/position.model';
import { ServerPushService } from './server-push.service';

@Injectable({ providedIn: 'root' })
export class LocationTrackerService {
  private readonly serverPush = inject(ServerPushService);
  private readonly simulationIntervalMs = 5000;
  private readonly fallbackOrigin = {
    latitude: 39.6,
    longitude: -8.2,
  };
  private watchId: number | null = null;
  private simulationTimer: ReturnType<typeof setInterval> | null = null;
  private simulatedPosition: Position | null = null;

  readonly tracking = signal(false);
  readonly status = signal('Idle');
  readonly lastPosition = signal<Position | null>(null);
  readonly lastError = signal<string | null>(null);
  readonly recentPositions = signal<Position[]>([]);
  readonly supportsGeolocation = computed(
    () => typeof navigator !== 'undefined' && 'geolocation' in navigator,
  );

  async startTracking(): Promise<void> {
    if (this.tracking()) {
      return;
    }

    if (!this.supportsGeolocation()) {
      await this.startSimulatedTracking('This browser does not support geolocation.');
      return;
    }

    this.tracking.set(true);
    this.status.set('Requesting location permission...');
    this.lastError.set(null);

    try {
      const position = await this.getCurrentPosition();
      await this.handlePosition(position);
    } catch (error) {
      await this.startSimulatedTracking(this.describeGeolocationError(error));
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        void this.handlePosition(position);
      },
      (error) => {
        void this.startSimulatedTracking(this.describeGeolocationError(error));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );

    this.status.set('Tracking live position updates.');
  }

  stopTracking(): void {
    if (this.watchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.simulationTimer !== null) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    this.simulatedPosition = null;

    this.tracking.set(false);
    this.status.set('Tracking stopped.');
  }

  async clearRemoteData(): Promise<void> {
    await this.serverPush.clear();
    this.recentPositions.set([]);
    this.lastPosition.set(null);
    this.lastError.set(null);
    this.status.set('Remote data cleared.');
  }

  private async handlePosition(position: GeolocationPosition): Promise<void> {
    if (this.simulationTimer !== null) {
      clearInterval(this.simulationTimer);
      this.simulationTimer = null;
    }

    this.simulatedPosition = null;

    const mappedPosition: Position = {
      accuracy: position.coords.accuracy,
      bearing: position.coords.heading,
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      speed: position.coords.speed,
      time: position.timestamp,
    };

    this.lastPosition.set(mappedPosition);
    this.lastError.set(null);
    this.recentPositions.update((positions) => [mappedPosition, ...positions].slice(0, 8));
    this.status.set('Latest location sent to the server.');
    await this.serverPush.pushPosition(mappedPosition);
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });
  }

  private async handleGeolocationError(error: GeolocationPositionError | unknown): Promise<void> {
    const message = this.describeGeolocationError(error);
    await this.startSimulatedTracking(message);
  }

  private async startSimulatedTracking(reason: string): Promise<void> {
    if (this.watchId !== null && typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    this.tracking.set(true);
    this.lastError.set(reason);
    this.status.set('Device location unavailable. Streaming simulated positions.');
    await this.serverPush.pushError(`${reason} Falling back to simulated positions.`);

    if (this.simulationTimer !== null) {
      return;
    }

    this.simulatedPosition = this.createInitialSimulatedPosition();
    await this.pushSimulatedPosition();

    this.simulationTimer = setInterval(() => {
      void this.pushSimulatedPosition();
    }, this.simulationIntervalMs);
  }

  private async pushSimulatedPosition(): Promise<void> {
    const nextPosition = this.createNextSimulatedPosition();

    this.lastPosition.set(nextPosition);
    this.recentPositions.update((positions) => [nextPosition, ...positions].slice(0, 8));
    await this.serverPush.pushPosition(nextPosition);
  }

  private createInitialSimulatedPosition(): Position {
    const seed = this.lastPosition();

    return {
      accuracy: seed?.accuracy ?? this.randomInRange(5, 14),
      bearing: seed?.bearing ?? this.randomInRange(0, 359),
      latitude: seed?.latitude ?? this.fallbackOrigin.latitude,
      longitude: seed?.longitude ?? this.fallbackOrigin.longitude,
      speed: seed?.speed ?? this.randomInRange(18, 34),
      time: Date.now(),
    };
  }

  private createNextSimulatedPosition(): Position {
    const previous = this.simulatedPosition ?? this.createInitialSimulatedPosition();
    const nextBearing = ((previous.bearing ?? 0) + this.randomInRange(-20, 20) + 360) % 360;
    const nextSpeed = this.randomInRange(18, 34);
    const travelDistanceMeters = nextSpeed * (this.simulationIntervalMs / 1000);
    const nextCoordinates = this.projectCoordinates(
      previous.latitude,
      previous.longitude,
      nextBearing,
      travelDistanceMeters,
    );
    const nextPosition: Position = {
      accuracy: this.randomInRange(5, 14),
      bearing: nextBearing,
      latitude: nextCoordinates.latitude,
      longitude: nextCoordinates.longitude,
      speed: nextSpeed,
      time: Date.now(),
    };

    this.simulatedPosition = nextPosition;
    return nextPosition;
  }

  private projectCoordinates(
    latitude: number,
    longitude: number,
    bearingInDegrees: number,
    distanceInMeters: number,
  ): { latitude: number; longitude: number } {
    const earthRadiusMeters = 6371008.8;
    const bearing = (bearingInDegrees * Math.PI) / 180;
    const angularDistance = distanceInMeters / earthRadiusMeters;
    const startLatitude = (latitude * Math.PI) / 180;
    const startLongitude = (longitude * Math.PI) / 180;

    const projectedLatitude = Math.asin(
      Math.sin(startLatitude) * Math.cos(angularDistance)
        + Math.cos(startLatitude) * Math.sin(angularDistance) * Math.cos(bearing),
    );
    const projectedLongitude =
      startLongitude
      + Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(startLatitude),
        Math.cos(angularDistance) - Math.sin(startLatitude) * Math.sin(projectedLatitude),
      );

    return {
      latitude: this.clampLatitude((projectedLatitude * 180) / Math.PI),
      longitude: this.normalizeLongitude((projectedLongitude * 180) / Math.PI),
    };
  }

  private clampLatitude(latitude: number): number {
    return Math.max(-90, Math.min(90, latitude));
  }

  private normalizeLongitude(longitude: number): number {
    if (longitude > 180) {
      return longitude - 360;
    }

    if (longitude < -180) {
      return longitude + 360;
    }

    return longitude;
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  private async reportError(message: string): Promise<void> {
    this.lastError.set(message);
    this.status.set(message);
    await this.serverPush.pushError(message);
  }

  private describeGeolocationError(error: GeolocationPositionError | unknown): string {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      const message = Reflect.get(error, 'message');

      if (typeof message === 'string') {
        return message;
      }
    }

    return 'Unable to read the current location.';
  }
}
