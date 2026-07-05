import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
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

import { SignupRequest } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup-page',
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
  templateUrl: './signup.page.html',
  styleUrl: './signup.page.css',
})
export class SignupPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loadingController = inject(LoadingController);
  private readonly toastController = inject(ToastController);

  private readonly model = signal<SignupRequest>({
    name: '',
    email: '',
    username: '',
    password: '',
  });
  protected readonly usernameTaken = signal(false);
  protected readonly form = form(this.model, (path) => {
    required(path.name);
    required(path.email);
    email(path.email);
    required(path.username);
    required(path.password);
  });

  async signup(): Promise<void> {
    this.usernameTaken.set(false);

    if (this.form().invalid()) {
      this.form().markAsTouched();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creating account...',
    });

    await loading.present();

    try {
      const result = await firstValueFrom(this.authService.signup(this.form().value()));

      if (result === 'exists') {
        this.form.username().markAsTouched();
        this.usernameTaken.set(true);
        await this.presentToast('Username already registered');
        return;
      }

      await this.presentToast('Sign up successful');
      await this.router.navigateByUrl('/home');
    } catch {
      await this.presentToast('Unexpected error occurred');
    } finally {
      await loading.dismiss();
    }
  }

  protected controlHasError(
    controlName: 'name' | 'email' | 'username' | 'password',
    errorName: string,
  ): boolean {
    const field = this.form[controlName]();
    return field.touched() && field.getError(errorName) !== undefined;
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
