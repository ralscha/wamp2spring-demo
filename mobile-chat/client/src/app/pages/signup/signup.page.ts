import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, NonNullableFormBuilder } from '@angular/forms';
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

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup-page',
  imports: [
    ReactiveFormsModule,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupPage {
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly loadingController = inject(LoadingController);
  private readonly toastController = inject(ToastController);

  protected readonly form = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  async signup(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creating account...',
    });

    await loading.present();

    try {
      const result = await firstValueFrom(this.authService.signup(this.form.getRawValue()));

      if (result === 'exists') {
        this.form.controls.username.setErrors({ usernameTaken: true });
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
    const control = this.form.controls[controlName];
    return control.touched && control.hasError(errorName);
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
