import {Component, NgZone} from '@angular/core';
import {AuthProvider} from "../../providers/auth/auth";
import {WampProvider} from "../../providers/wamp/wamp";
import {ItemSliding, NavController} from "ionic-angular";
import {Room} from "../../room";
import uuid from 'uuid';
import {ChatPage} from "../chat/chat";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  private roomsMap: Map<string, Room> = new Map();
  rooms: Room[] = [];

  addRoomMode: boolean = false;
  newRoomName: string;

  constructor(private readonly authProvider: AuthProvider,
              private readonly wampProvider: WampProvider,
              private readonly ngZone: NgZone,
              private readonly navCtrl: NavController) {
  }

  ionViewDidLoad() {
    this.authProvider.authUser.subscribe(jwt => {
      this.wampProvider.connect(jwt).then(() => {
        this.readRooms();
        this.wampProvider.subscribeRooms((arg, kwargs) => {
          if (kwargs.action === 'new') {
            const room = kwargs.room;
            this.roomsMap.set(room.id, room);
          }
          else if (kwargs.action === 'remove') {
            const room = kwargs.room;
            this.roomsMap.delete(room.id);
          }
          this.ngZone.run(() => this.rooms = Array.from(this.roomsMap.values()));
        });
      });
    });
  }

  readRooms() {
    this.roomsMap.clear();
    this.wampProvider.readRooms().then(result => {
      for (let room of result) {
        this.roomsMap.set(room.id, room);
      }
      this.ngZone.run(() => this.rooms = Array.from(this.roomsMap.values()));
    });
  }

  logout() {
    this.authProvider.logout();
  }

  addRoom() {
    this.addRoomMode = true;
  }

  cancelAddRoom() {
    this.newRoomName = '';
    this.addRoomMode = false;
  }

  onRoomSelected(room: Room) {
    this.cancelAddRoom();
    this.navCtrl.push(ChatPage, room);
  }

  removeRoom(room: Room, slidingItem: ItemSliding) {
    slidingItem.close();
    this.addRoomMode = false;
    this.wampProvider.removeRoom(room).then(() => {
      this.roomsMap.delete(room.id);
      this.ngZone.run(() => this.rooms = Array.from(this.roomsMap.values()));
      this.wampProvider.publish('rooms', [], {action: 'remove', room});
    });
  }

  newRoom() {
    const newRoom: Room = {
      id: uuid.v4(),
      name: this.newRoomName
    };

    this.wampProvider.newRoom(newRoom).then(() => {
      this.roomsMap.set(newRoom.id, newRoom);
      this.newRoomName = '';
      this.ngZone.run(() => this.rooms = Array.from(this.roomsMap.values()));
      this.addRoomMode = false;
      this.wampProvider.publish('rooms', [], {action: 'new', room:newRoom});
    });
  }

}
