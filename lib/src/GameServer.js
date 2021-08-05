"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameServer = void 0;
const Player_1 = require("./Player");
const GameRoom_1 = require("./GameRoom");
const GameCore_1 = require("./GameCore");
function predicateBy(prop) {
    return (a, b) => {
        if (a[prop] > b[prop]) {
            return 1;
        }
        if (a[prop] < b[prop]) {
            return -1;
        }
        return 0;
    };
}
class GameServer {
    constructor(io) {
        this.players = new Map();
        this.rooms = [];
        this.games = [];
        this.io = io;
    }
    onCreate() {
        this.io.on('connection', (socket) => {
            this.onPlayerConnected(socket);
            socket.on('newChatMessage', (data) => {
                const senderName = this.players.get(data.senderId).name;
                this.io.emit('newChatMessage', Object.assign({ senderName }, data));
            });
            socket.on('askCreateRoom', ({ ownerId }) => {
                const newRoom = new GameRoom_1.GameRoom(this.players.get(ownerId));
                this.rooms.push(newRoom);
                this.broadcastRooms();
            });
            socket.on('askLeaveRoom', ({ roomId }) => {
                var _a;
                console.log('asked leave room', { roomId });
                (_a = this.rooms.find((room) => room.id === roomId)) === null || _a === void 0 ? void 0 : _a.leave(socket.id);
                this.broadcastRooms();
            });
            socket.on('askJoinRoom', ({ roomId }) => {
                var _a;
                (_a = this.rooms.find((room) => room.id === roomId)) === null || _a === void 0 ? void 0 : _a.join(this.players.get(socket.id));
                this.broadcastRooms();
            });
            socket.on('askStartGame', ({ roomId }) => {
                const roomToStart = this.rooms.find((room) => room.id === roomId);
                roomToStart === null || roomToStart === void 0 ? void 0 : roomToStart.start();
                this.broadcastRooms();
                this.games.push(new GameCore_1.GameCore(roomToStart.players));
            });
            socket.on('askMakePlay', ({ gameId, action }) => {
                const game = this.games.find((g) => g.id === gameId);
                const winnerId = game === null || game === void 0 ? void 0 : game.makePlay(socket.id, action);
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
    onPlayerConnected(socket) {
        const player = new Player_1.Player(socket);
        this.players.set(socket.id, player);
        socket.emit('receivePersonalInfo', { name: player.name, wins: player.wins });
        this.broadcastRooms();
        this.broadcastLeaderboards();
        this.io.emit('newChatMessage', {
            body: `${player.name} joined. Say hello! 👋`
        });
    }
    onPlayerDisconnect(socket) {
        var _a;
        this.players.delete(socket.id);
        (_a = this.rooms.find((room) => !!room.players.get(socket.id))) === null || _a === void 0 ? void 0 : _a.leave(socket.id);
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
exports.GameServer = GameServer;
