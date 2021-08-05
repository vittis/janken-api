/* eslint-disable no-param-reassign */
import { v4 as uuidv4 } from 'uuid';
import { Action } from './GameCore';
import { Player } from './Player';

enum RoomStatus {
  OPEN = 'OPEN',
  FULL = 'FULL',
  IN_PROGRESS = 'IN_PROGRESS'
}

export class GameRoom {
    id: string;
    public players: Map<string, Player> = new Map();
    status: RoomStatus;

    constructor(owner: Player) {
      this.id = uuidv4();
      owner.action = Action.NOT_PLAYED;
      this.players.set(owner.socket.id, owner);
      this.status = RoomStatus.OPEN;
    }

    join(player: Player) {
      player.action = Action.NOT_PLAYED;
      this.players.set(player.socket.id, player);
      if (this.players.size === 2) {
        this.status = RoomStatus.FULL;
      }
    }

    leave(playerId: string) {
      this.players.delete(playerId);
      if (this.players.size < 2) {
        this.status = RoomStatus.OPEN;
      }
    }

    start() {
      this.status = RoomStatus.IN_PROGRESS;
    }

    serialize() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const serializedPlayers = Array.from(this.players).map(([_id, player]) => player.serialize());

      return {
        id: this.id,
        players: serializedPlayers,
        status: this.status
      };
    }
}
