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
import {AuthProvider} from "../providers/auth/auth";
import {WampProvider} from '../providers/wamp/wamp';
import {ChatPage} from "../pages/chat/chat";
import {WriteMessagePage} from "../pages/write-message/write-message";
import {HttpClientModule} from "@angular/common/http";
import {JWT_OPTIONS, JwtModule} from "@auth0/angular-jwt";

export function jwtOptionsFactory(storage: Storage) {
  return {
    tokenGetter: () => storage.get('jwt_token'),
    whitelistedDomains: ['localhost:8080']
  }
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
    HttpClientModule,
    JwtModule.forRoot({
      jwtOptionsProvider: {
        provide: JWT_OPTIONS,
        useFactory: jwtOptionsFactory,
        deps: [Storage]
      }
    }),
    IonicModule.forRoot(MyApp),
    IonicStorageModule.forRoot(),
    CustomFormsModule
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
    WampProvider]
})
export class AppModule {
}
