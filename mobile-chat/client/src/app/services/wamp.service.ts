import { Injectable } from '@angular/core';
import autobahn from 'autobahn-browser';

import { APP_ENVIRONMENT } from '../models/app-environment';
import { Message } from '../models/message';
import { Room, RoomEvent } from '../models/room';

@Injectable({ providedIn: 'root' })
export class WampService {
  private connection: AutobahnConnection | null = null;
  private session: AutobahnSession | null = null;
  private connectionPromise: Promise<void> | null = null;
  private connectedToken: string | null = null;

  async connect(jwt: string): Promise<void> {
    if (this.session && this.connectedToken === jwt) {
      return;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.connectedToken !== jwt) {
      this.disconnect();
    }

    this.connectionPromise = new Promise<void>((resolve, reject) => {
      const connection = new autobahn.Connection({
        url: `${APP_ENVIRONMENT.wsBaseUrl}/wamp?access_token=${jwt}`,
        realm: '',
      });

      connection.onopen = (session) => {
        this.connection = connection;
        this.session = session;
        this.connectedToken = jwt;
        this.connectionPromise = null;
        resolve();
      };

      connection.onclose = () => {
        this.connection = null;
        this.session = null;
        this.connectedToken = null;
        this.connectionPromise = null;
        return true;
      };

      try {
        connection.open();
      } catch (error) {
        this.connectionPromise = null;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  disconnect(): void {
    try {
      this.connection?.close();
    } catch {
      this.connection = null;
      this.session = null;
      this.connectedToken = null;
      this.connectionPromise = null;
    }
  }

  async readRooms(): Promise<Room[]> {
    return this.requireSession().call<Room[]>('demo.mobilechat.readRooms');
  }

  async newRoom(room: Room): Promise<void> {
    return this.requireSession().call<void>('demo.mobilechat.newRoom', [room]);
  }

  async removeRoom(roomId: string): Promise<void> {
    return this.requireSession().call<void>('demo.mobilechat.removeRoom', [roomId]);
  }

  async sendMessage(roomId: string, message: Message): Promise<void> {
    return this.requireSession().call<void>('demo.mobilechat.sendMessage', [roomId, message]);
  }

  async subscribeRooms(handler: (event: RoomEvent) => void): Promise<AutobahnSubscription> {
    return this.requireSession().subscribe<unknown[], RoomEvent>('demo.mobilechat.rooms', (_args, kwargs) =>
      handler(kwargs),
    );
  }

  async subscribeToRoom(
    roomId: string,
    handler: (messages: Message[]) => void,
  ): Promise<AutobahnSubscription> {
    return this.requireSession().subscribe<Message[], Record<string, unknown>>(
      `chat.${roomId}`,
      (args) => handler(this.normalizeRoomMessages(args)),
    );
  }

  unsubscribe(subscription: AutobahnSubscription): void {
    this.session?.unsubscribe(subscription);
  }

  async publish(
    topic: string,
    args: unknown[],
    kwargs?: Record<string, unknown>,
    options?: { acknowledge?: boolean; exclude_me?: boolean },
  ): Promise<void> {
    await this.requireSession().publish(topic, args, kwargs, options);
  }

  private requireSession(): AutobahnSession {
    if (!this.session) {
      throw new Error('WAMP session is not connected.');
    }

    return this.session;
  }

  private normalizeRoomMessages(args: Message[]): Message[] {
    if (args.length === 1 && Array.isArray(args[0])) {
      return args[0] as unknown as Message[];
    }

    return args;
  }
}
