import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
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
    ReactiveFormsModule,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WriteMessageModalComponent {
  private readonly modalController = inject(ModalController);
  private readonly toastController = inject(ToastController);
  private readonly wampService = inject(WampService);

  @Input({ required: true }) room!: Room;

  @Input({ required: true }) user!: string;

  protected readonly messageControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(500)],
  });

  protected async dismiss(): Promise<void> {
    await this.modalController.dismiss();
  }

  protected async sendMessage(): Promise<void> {
    if (this.messageControl.invalid) {
      this.messageControl.markAsTouched();
      return;
    }

    const message: Message = {
      ts: Date.now(),
      msg: this.messageControl.getRawValue().trim(),
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
