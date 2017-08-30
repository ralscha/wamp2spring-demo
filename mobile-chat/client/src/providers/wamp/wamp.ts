import {Inject, Injectable} from "@angular/core";
import {Storage} from "@ionic/storage";
import {EnvVariables} from "../../env/environment-variables.token";
import {Room} from "../../room";

declare var autobahn: any;

@Injectable()
export class WampProvider {

  private wampSession: any;

  constructor(private readonly storage: Storage, @Inject(EnvVariables) private readonly envVariables) {
  }

  connect(jwt): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const connection = new autobahn.Connection({url: `${this.envVariables.WS_SCHEME}${this.envVariables.SERVER_ADDRESS}/wamp?access_token=${jwt}`});
      connection.onopen = (session, details) => {
        this.wampSession = session;
        resolve();
      };
      connection.open();
    });
  }

  readRooms(): Promise<Room[]> {
    return this.wampSession.call('readRooms');
  }

  newRoom(room: Room): Promise<void> {
    return this.wampSession.call('newRoom', [room]);
  }

  removeRoom(room: Room): Promise<void> {
    return this.wampSession.call('removeRoom', [room.id]);
  }

  subscribeRooms(handler: (arg: any[], kwargs: any) => void): Promise<any> {
    return this.wampSession.subscribe('rooms', handler);
  }

  subscribe(room: Room, handler: (arg: any) => void): Promise<any> {
    return this.wampSession.subscribe(`chat.${room.id}`, handler);
  }

  unsubscribe(subscription) {
    this.wampSession.unsubscribe(subscription);
  }

  publish(topic, arg: any[], kwargs: any = null) {
    this.wampSession.publish(topic, arg, kwargs)
  }

}
