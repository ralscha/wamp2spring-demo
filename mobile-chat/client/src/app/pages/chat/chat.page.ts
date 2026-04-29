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
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';

import { Message } from '../../models/message';
import { Room } from '../../models/room';
import { AuthService } from '../../services/auth.service';
import { WampService } from '../../services/wamp.service';
import { WriteMessageModalComponent } from './write-message-modal.component';

@Component({
  selector: 'app-chat-page',
  imports: [IonButton, IonButtons, IonContent, IonHeader, IonTitle, IonToolbar],
  templateUrl: './chat.page.html',
  styleUrl: './chat.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);
  private readonly wampService = inject(WampService);
  private readonly ngZone = inject(NgZone);
  private readonly modalController = inject(ModalController);
  private readonly toastController = inject(ToastController);

  private chatSubscription: AutobahnSubscription | null = null;

  protected readonly room = signal<Room | null>((history.state?.room as Room | undefined) ?? null);
  protected readonly messages = signal<Message[]>([]);
  protected readonly sortedMessages = computed(() =>
    [...this.messages()].sort((left, right) => left.ts - right.ts),
  );
  protected readonly currentUser = this.authService.user;

  async ngOnInit(): Promise<void> {
    const roomId = this.route.snapshot.paramMap.get('roomId');
    const jwt = this.authService.token();

    if (!roomId || !jwt) {
      void this.router.navigateByUrl('/home');
      return;
    }

    try {
      await this.wampService.connect(jwt);

      if (!this.room()) {
        const rooms = await this.wampService.readRooms();
        this.room.set(
          rooms.find((candidate) => candidate.id === roomId) ?? { id: roomId, name: 'Chat room' },
        );
      }

      this.chatSubscription = await this.wampService.subscribeToRoom(roomId, (messages) => {
        this.ngZone.run(() => {
          this.messages.update((currentMessages) => [...currentMessages, ...messages]);
        });
      });
    } catch {
      await this.presentToast('Could not connect to this room.');
    }
  }

  ngOnDestroy(): void {
    if (this.chatSubscription) {
      this.wampService.unsubscribe(this.chatSubscription);
      this.chatSubscription = null;
    }
  }

  protected async compose(): Promise<void> {
    const room = this.room();
    const user = this.currentUser();

    if (!room || !user) {
      return;
    }

    const modal = await this.modalController.create({
      component: WriteMessageModalComponent,
      componentProps: { room, user },
    });

    await modal.present();

    await modal.onWillDismiss<void>();
  }

  protected backToRooms(): void {
    void this.router.navigateByUrl('/home');
  }

  protected isOwnMessage(message: Message): boolean {
    return message.sender === this.currentUser();
  }

  protected formatTimestamp(timestamp: number): string {
    return new Intl.DateTimeFormat([], {
      hour: 'numeric',
      minute: '2-digit',
    }).format(timestamp);
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
