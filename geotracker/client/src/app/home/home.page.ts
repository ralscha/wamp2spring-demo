import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';

import { LocationTrackerService } from '../core/services/location-tracker.service';
import { ServerPushService } from '../core/services/server-push.service';

@Component({
  selector: 'app-home',
  imports: [
    DatePipe,
    DecimalPipe,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly serverPush = inject(ServerPushService);

  readonly locationTracker = inject(LocationTrackerService);
  readonly serverUrl = this.serverPush.getServerUrl();
  readonly trackingLabel = computed(() => (this.locationTracker.tracking() ? 'Tracking' : 'Idle'));

  async start(): Promise<void> {
    await this.locationTracker.startTracking();
  }

  stop(): void {
    this.locationTracker.stopTracking();
  }

  async clear(): Promise<void> {
    await this.locationTracker.clearRemoteData();
  }
}
