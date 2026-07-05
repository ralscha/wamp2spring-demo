import { Component, Input, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, maxLength, required } from '@angular/forms/signals';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonTextarea,
  IonText,
  IonTitle,
  IonToolbar,
  ModalController,
  ToastController,
} from '@ionic/angular/standalone';

import { Message } from '../../models/message';
import { Room } from '../../models/room';
import { WampService } from '../../services/wamp.service';

@Component({
  selector: 'app-write-message-modal',
  imports: [
    FormField,
    FormRoot,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonTextarea,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './write-message-modal.component.html',
  styleUrl: './write-message-modal.component.css',
})
export class WriteMessageModalComponent {
  private readonly modalController = inject(ModalController);
  private readonly toastController = inject(ToastController);
  private readonly wampService = inject(WampService);

  @Input({ required: true }) room!: Room;

  @Input({ required: true }) user!: string;

  private readonly message = signal('');
  protected readonly messageForm = form(this.message, (path) => {
    required(path);
    maxLength(path, 500);
  });

  protected async dismiss(): Promise<void> {
    await this.modalController.dismiss();
  }

  protected async sendMessage(): Promise<void> {
    if (this.messageForm().invalid()) {
      this.messageForm().markAsTouched();
      return;
    }

    const message: Message = {
      ts: Date.now(),
      msg: this.messageForm().value().trim(),
      sender: this.user,
    };

    try {
      await this.wampService.sendMessage(this.room.id, message);
    } catch {
      const toast = await this.toastController.create({
        message: 'Unable to send message right now.',
        duration: 3000,
        position: 'bottom',
      });

      await toast.present();
      return;
    }

    const toast = await this.toastController.create({
      message: 'Message sent',
      duration: 3000,
      position: 'bottom',
    });

    await toast.present();
    await this.modalController.dismiss();
  }
}
