import { Server, Socket } from 'socket.io';
import { Player } from './Player';
import { GameRoom } from './GameRoom';
import { Action, GameCore } from './GameCore';

interface IncomingChatMessage {
    body: string,
    senderId: string
}

function predicateBy(prop: string) {
  return (a: any, b:any) => {
    if (a[prop] > b[prop]) {
      return 1;
    } if (a[prop] < b[prop]) {
      return -1;
    }
    return 0;
  };
}

export class GameServer {
    io: Server;
    players: Map<string, Player> = new Map();
    rooms: GameRoom[] = [];
    games: GameCore[] = [];

    constructor(io: Server) {
      this.io = io;
    }

    onCreate() {
      this.io.on('connection', (socket) => {
        this.onPlayerConnected(socket);

        socket.on('newChatMessage', (data: IncomingChatMessage) => {
          const senderName = this.players.get(data.senderId).name;
          this.io.emit('newChatMessage', { senderName, ...data });
        });

        socket.on('askCreateRoom', ({ ownerId }: {ownerId: string}) => {
          const newRoom = new GameRoom(this.players.get(ownerId));
          this.rooms.push(newRoom);
          this.broadcastRooms();
        });

        socket.on('askLeaveRoom', ({ roomId }: {roomId: string}) => {
          console.log('asked leave room', { roomId });
          this.rooms.find((room) => room.id === roomId)?.leave(socket.id);
          this.broadcastRooms();
        });

        socket.on('askJoinRoom', ({ roomId }: {roomId: string}) => {
          this.rooms.find((room) => room.id === roomId)?.join(this.players.get(socket.id));
          this.broadcastRooms();
        });

        socket.on('askStartGame', ({ roomId }: {roomId: string}) => {
          const roomToStart = this.rooms.find((room) => room.id === roomId);
          roomToStart?.start();
          this.broadcastRooms();
          this.games.push(new GameCore(roomToStart.players));
        });

        socket.on('askMakePlay', ({ gameId, action }: {gameId: string, action: Action}) => {
          const game = this.games.find((g) => g.id === gameId);
          const winnerId = game?.makePlay(socket.id, action);

          if (winnerId) {
            game.players.forEach((player) => {
              if (player.id === winnerId) {
                player.socket.emit('receivePersonalInfo', { name: player.name, wins: player.wins + 1 });
              }
            });
            game.players.clear();
            if (winnerId !== 'TIE') {
              this.players.get(winnerId).wins += 1;
            }
            this.broadcastRooms();
            this.broadcastLeaderboards();
          }
        });

        socket.on('disconnect', () => {
          this.onPlayerDisconnect(socket);
        });
      });
    }

    getTop3Players() {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const serializedPlayers = Array.from(this.players).map(([_id, player]) => player.serialize());

      serializedPlayers.sort(predicateBy('wins'));
      serializedPlayers.reverse();
      serializedPlayers.splice(3, serializedPlayers.length - 3);

      return serializedPlayers;
    }

    broadcastLeaderboards() {
      this.io.emit('broadcastLeaderboards', {
        players: this.getTop3Players()
      });
    }

    onPlayerConnected(socket: Socket) {
      const player = new Player(socket);
      this.players.set(socket.id, player);
      socket.emit('receivePersonalInfo', { name: player.name, wins: player.wins });
      this.broadcastRooms();
      this.broadcastLeaderboards();

      this.io.emit('newChatMessage', {
        body: `${player.name} joined. Say hello! 👋`
      });
    }

    onPlayerDisconnect(socket: Socket) {
      this.players.delete(socket.id);
      this.rooms.find((room) => !!room.players.get(socket.id))?.leave(socket.id);
      this.broadcastRooms();
      this.broadcastLeaderboards();
    }

    broadcastRooms() {
      this.clearEmptyRoomsAndGames();
      this.io.emit('broadcastRooms', { rooms: this.getSerializedRooms() });
    }

    getSerializedRooms() {
      return this.rooms.map((room) => room.serialize());
    }

    clearEmptyRoomsAndGames() {
      this.rooms = this.rooms.filter((room) => room.players.size > 0);
      this.games = this.games.filter((game) => game.players.size > 0);
    }
}
