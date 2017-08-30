import {Component} from '@angular/core';
import {ModalController, NavParams} from 'ionic-angular';
import {WriteMessagePage} from '../write-message/write-message';
import {Room} from "../../room";
import {Message} from "../../message";
import {WampProvider} from "../../providers/wamp/wamp";
import {JwtHelper} from "angular2-jwt";
import {AuthProvider} from "../../providers/auth/auth";

@Component({
  selector: 'page-chat',
  templateUrl: 'chat.html',
})
export class ChatPage {
  room: Room = null;
  messages: Message[] = [];
  user = '';
  subscription: any = null;

  constructor(private readonly navParams: NavParams,
              private readonly wampProvider: WampProvider,
              private readonly modalCtrl: ModalController,
              private readonly authProvider: AuthProvider,
              jwtHelper: JwtHelper) {
    this.authProvider.authUser.subscribe(jwt => {
      if (jwt) {
        const decoded = jwtHelper.decodeToken(jwt);
        this.user = decoded.sub
      }
      else {
        this.user = null;
      }
    });
  }

  ionViewWillEnter() {
    if (!this.subscription) {
      this.room = this.navParams.data;
      this.wampProvider.subscribe(this.room, (arg) => {
        this.messages.push(...arg);
      }).then(sub => this.subscription = sub);
    }
  }

  ionViewWillLeave() {
    if (this.subscription) {
      this.wampProvider.unsubscribe(this.subscription);
      this.subscription = null;
    }
  }

  compose() {
    const writeMessagePage = this.modalCtrl.create(WriteMessagePage, {room: this.room, user: this.user});
    writeMessagePage.present();

    writeMessagePage.onWillDismiss(msg => {
      if (msg) {
        this.messages.push(msg);
      }
    });
  }

}
