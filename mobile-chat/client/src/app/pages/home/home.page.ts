import {
  ChangeDetectionStrategy,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonText,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';

import { Room, RoomEvent } from '../../models/room';
import { AuthService } from '../../services/auth.service';
import { WampService } from '../../services/wamp.service';

@Component({
  selector: 'app-home-page',
  imports: [
    ReactiveFormsModule,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly wampService = inject(WampService);
  private readonly ngZone = inject(NgZone);
  private readonly toastController = inject(ToastController);

  private readonly roomsMap = new Map<string, Room>();
  private roomsSubscription: AutobahnSubscription | null = null;

  protected readonly rooms = signal<Room[]>([]);
  protected readonly addRoomMode = signal(false);
  protected readonly roomNameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(60)],
  });
  protected readonly hasRooms = computed(() => this.rooms().length > 0);
  protected readonly username = this.authService.user;

  async ngOnInit(): Promise<void> {
    const jwt = this.authService.token();

    if (!jwt) {
      return;
    }

    try {
      await this.wampService.connect(jwt);
      await this.loadRooms();
      this.roomsSubscription = await this.wampService.subscribeRooms((event) =>
        this.handleRoomEvent(event),
      );
    } catch {
      await this.presentToast('Could not connect to the chat server.');
    }
  }

  ngOnDestroy(): void {
    if (this.roomsSubscription) {
      this.wampService.unsubscribe(this.roomsSubscription);
      this.roomsSubscription = null;
    }
  }

  protected openRoom(room: Room): void {
    void this.router.navigate(['/chat', room.id], { state: { room } });
  }

  protected showAddRoom(): void {
    this.addRoomMode.set(true);
  }

  protected cancelAddRoom(): void {
    this.roomNameControl.setValue('');
    this.roomNameControl.markAsPristine();
    this.roomNameControl.markAsUntouched();
    this.addRoomMode.set(false);
  }

  protected async createRoom(): Promise<void> {
    if (this.roomNameControl.invalid) {
      this.roomNameControl.markAsTouched();
      return;
    }

    const room: Room = {
      id: crypto.randomUUID(),
      name: this.roomNameControl.getRawValue().trim(),
    };

    try {
      await this.wampService.newRoom(room);
      this.roomsMap.set(room.id, room);
      this.syncRooms();
      this.cancelAddRoom();
      this.wampService.publish('demo.mobilechat.rooms', [], { action: 'new', room });
    } catch {
      await this.presentToast('Unable to add room right now.');
    }
  }

  protected async removeRoom(room: Room): Promise<void> {
    try {
      await this.wampService.removeRoom(room.id);
      this.roomsMap.delete(room.id);
      this.syncRooms();
      this.wampService.publish('demo.mobilechat.rooms', [], { action: 'remove', room });
    } catch {
      await this.presentToast('Unable to delete room right now.');
    }
  }

  protected logout(): void {
    this.authService.logout();
  }

  private async loadRooms(): Promise<void> {
    this.roomsMap.clear();

    const rooms = await this.wampService.readRooms();

    for (const room of rooms) {
      this.roomsMap.set(room.id, room);
    }

    this.syncRooms();
  }

  private handleRoomEvent(event: RoomEvent): void {
    this.ngZone.run(() => {
      if (event.action === 'new') {
        this.roomsMap.set(event.room.id, event.room);
      } else {
        this.roomsMap.delete(event.room.id);
      }

      this.syncRooms();
    });
  }

  private syncRooms(): void {
    this.rooms.set(
      Array.from(this.roomsMap.values()).sort((left, right) => left.name.localeCompare(right.name)),
    );
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      position: 'bottom',
    });

    await toast.present();
  }
}
