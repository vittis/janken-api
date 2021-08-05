"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameRoom = void 0;
/* eslint-disable no-param-reassign */
const uuid_1 = require("uuid");
const GameCore_1 = require("./GameCore");
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["OPEN"] = "OPEN";
    RoomStatus["FULL"] = "FULL";
    RoomStatus["IN_PROGRESS"] = "IN_PROGRESS";
})(RoomStatus || (RoomStatus = {}));
class GameRoom {
    constructor(owner) {
        this.players = new Map();
        this.id = uuid_1.v4();
        owner.action = GameCore_1.Action.NOT_PLAYED;
        this.players.set(owner.socket.id, owner);
        this.status = RoomStatus.OPEN;
    }
    join(player) {
        player.action = GameCore_1.Action.NOT_PLAYED;
        this.players.set(player.socket.id, player);
        if (this.players.size === 2) {
            this.status = RoomStatus.FULL;
        }
    }
    leave(playerId) {
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
exports.GameRoom = GameRoom;
