import {Component} from '@angular/core';
import {NavParams, ToastController, ViewController} from 'ionic-angular';
import {Room} from "../../room";
import {WampProvider} from "../../providers/wamp/wamp";
import {Message} from "../../message";

@Component({
  selector: 'page-write-message',
  templateUrl: 'write-message.html',
})
export class WriteMessagePage {
  private room: Room;
  private message: string;
  private user: string;

  constructor(private readonly viewCtrl: ViewController,
              private readonly wampProvider: WampProvider,
              private readonly navParams: NavParams,
              private readonly toastCtrl: ToastController) {
  }

  ngOnInit() {
    this.room = this.navParams.get('room');
    this.user = this.navParams.get('user');
  }

  sendMessage() {
    const msg = {
      ts: new Date().getTime(),
      msg: this.message,
      sender: this.user
    };
    this.wampProvider.publish(`chat.${this.room.id}`, [msg]);
    this.dismiss(msg);

    const toast = this.toastCtrl.create({
      message: 'Message sent',
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  dismiss(data?: Message) {
    this.viewCtrl.dismiss(data);
  }

}
