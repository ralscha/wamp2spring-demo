export interface Room {
  id: string;
  name: string;
}

export interface RoomEvent {
  action: 'new' | 'remove';
  room: Room;
}
