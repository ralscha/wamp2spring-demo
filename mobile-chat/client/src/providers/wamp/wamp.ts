import {ENV} from '@app/env';
import {Room} from "../../room";

declare var autobahn: any;

export class WampProvider {

  private wampSession: any;

  connect(jwt): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const connection = new autobahn.Connection({url: `${ENV.WS_SCHEME}${ENV.SERVER_ADDRESS}/wamp?access_token=${jwt}`});
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
