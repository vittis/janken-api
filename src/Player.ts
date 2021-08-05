import { Socket } from 'socket.io';
import { uniqueNamesGenerator, starWars } from 'unique-names-generator';
import { Action } from './GameCore';

export class Player {
    socket: Socket;
    id: string;
    name: string;
    action: Action;
    wins = 0;

    constructor(socket: Socket) {
      this.socket = socket;
      this.id = socket.id;
      this.name = uniqueNamesGenerator({
        dictionaries: [starWars]
      });
    }

    serialize() {
      return { id: this.id, name: this.name, wins: this.wins };
    }
}
