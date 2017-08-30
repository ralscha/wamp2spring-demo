import {BrowserModule} from '@angular/platform-browser';
import {NgModule, ErrorHandler} from '@angular/core';
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {LoginPage} from "../pages/login/login";
import {SignupPage} from "../pages/signup/signup";
import {CustomFormsModule} from 'ng2-validation'
import {Storage, IonicStorageModule} from "@ionic/storage";
import {JwtHelper, AuthConfig, AuthHttp} from "angular2-jwt";
import {Http, HttpModule, RequestOptions} from "@angular/http";
import {AuthProvider} from "../providers/auth/auth";
import { WampProvider } from '../providers/wamp/wamp';
import {EnvironmentsModule} from "../env/environment-variables.module";
import {ChatPage} from "../pages/chat/chat";
import {WriteMessagePage} from "../pages/write-message/write-message";

export function authHttpServiceFactory(http: Http, options: RequestOptions, storage: Storage) {
  const authConfig = new AuthConfig({
    tokenGetter: (() => storage.get('jwt')),
  });
  return new AuthHttp(authConfig, http, options);
}

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    LoginPage,
    SignupPage,
    ChatPage,
    WriteMessagePage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    CustomFormsModule,
    EnvironmentsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    LoginPage,
    SignupPage,
    ChatPage,
    WriteMessagePage
  ],
  providers: [
    WampProvider,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    AuthProvider,
    JwtHelper, {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [Http, RequestOptions, Storage]
    },
    WampProvider]
})
export class AppModule {
}
