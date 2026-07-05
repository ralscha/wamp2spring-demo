import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonText,
  IonTitle,
  IonToolbar,
  LoadingController,
  ToastController,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';

import { LoginRequest } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [
    FormField,
    FormRoot,
    RouterLink,
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonContent,
    IonHeader,
    IonInput,
    IonItem,
    IonLabel,
    IonText,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
})
export class LoginPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loadingController = inject(LoadingController);
  private readonly toastController = inject(ToastController);

  private readonly model = signal<LoginRequest>({
    username: '',
    password: '',
  });
  protected readonly form = form(this.model, (path) => {
    required(path.username);
    required(path.password);
  });

  async login(): Promise<void> {
    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Logging in...',
    });

    await loading.present();

    try {
      await firstValueFrom(this.authService.login(this.form().value()));
      await this.router.navigateByUrl('/home');
    } catch (error: unknown) {
      await this.presentToast(this.getErrorMessage(error));
    } finally {
      await loading.dismiss();
    }
  }

  protected controlHasError(controlName: 'username' | 'password', errorName: string): boolean {
    const field = this.form[controlName]();
    return field.touched() && field.getError(errorName) !== undefined;
  }

  private getErrorMessage(error: unknown): string {
    if (typeof error === 'object' && error !== null) {
      const status = 'status' in error ? error.status : undefined;
      const statusText = 'statusText' in error ? error.statusText : undefined;

      if (status === 401) {
        return 'Login failed';
      }

      if (typeof statusText === 'string' && statusText.length > 0) {
        return `Unexpected error: ${statusText}`;
      }
    }

    return 'Unexpected error: Unknown error';
  }

  private async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'bottom',
    });

    await toast.present();
  }
}
