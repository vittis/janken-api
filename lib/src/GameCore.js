"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameCore = exports.Action = void 0;
/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-unused-vars */
const uuid_1 = require("uuid");
var Action;
(function (Action) {
    Action["ROCK"] = "ROCK";
    Action["PAPER"] = "PAPER";
    Action["SCISSORS"] = "SCISSORS";
    Action["NOT_PLAYED"] = "NOT_PLAYED";
})(Action = exports.Action || (exports.Action = {}));
const getActionEmoji = (action) => {
    if (action === Action.ROCK) {
        return '✊';
    }
    if (action === Action.PAPER) {
        return '🤚';
    }
    if (action === Action.SCISSORS) {
        return '✌';
    }
    return '';
};
class GameCore {
    constructor(players) {
        this.id = uuid_1.v4();
        this.players = players;
        this.playersIds = Array.from(players.keys());
        this.players.forEach((player) => {
            player.socket.emit('gameUpdated', this.serialize());
        });
    }
    getStatus() {
        const p1 = this.players.get(this.playersIds[0]);
        const p2 = this.players.get(this.playersIds[1]);
        const p1Action = p1.action;
        const p2Action = p2.action;
        const p1Played = p1Action !== Action.NOT_PLAYED;
        const p2Played = p2Action !== Action.NOT_PLAYED;
        if (p1Played && !p2Played) {
            return `Waiting for ${p1.name} 👀`;
        }
        if (p2Played && !p1Played) {
            return `Waiting for ${p2.name} 👀`;
        }
        const winnerId = this.getWinnerId();
        console.log({ winnerId });
        if (winnerId && winnerId !== 'TIE') {
            const p1Won = this.playersIds[0] === winnerId;
            if (p1Won) {
                return `${getActionEmoji(p1Action)} beats ${getActionEmoji(p2Action)}! ${p1.name} wins!`;
            }
            return `${getActionEmoji(p2Action)} beats ${getActionEmoji(p1Action)}! ${p2.name} wins!`;
        }
        if (winnerId && winnerId === 'TIE') {
            return `${getActionEmoji(p2Action)} does nothing to ${getActionEmoji(p1Action)}`;
        }
        return 'Choose wisely...';
    }
    getWinnerId() {
        const p1 = this.players.get(this.playersIds[0]);
        const p2 = this.players.get(this.playersIds[1]);
        const p1Action = p1.action;
        const p2Action = p2.action;
        const p1Played = p1Action !== Action.NOT_PLAYED;
        const p2Played = p2Action !== Action.NOT_PLAYED;
        if (p1Played && p2Played) {
            const p1won = p1Action === p2Action
                ? 'TIE'
                : p1Action === Action.ROCK && p2Action === Action.PAPER
                    ? false
                    : p1Action === Action.PAPER && p2Action === Action.SCISSORS
                        ? false
                        : !(p1Action === Action.SCISSORS && p2Action === Action.ROCK);
            if (p1won === 'TIE') {
                return 'TIE';
            }
            if (p1won) {
                return p1.id;
            }
            return p2.id;
        }
        return undefined;
    }
    makePlay(playerId, action) {
        this.players.get(playerId).action = action;
        this.players.forEach((player) => {
            player.socket.emit('gameUpdated', this.serialize());
        });
        return this.getWinnerId();
    }
    serialize() {
        const serializedPlayers = Array.from(this.players).map(([_id, player]) => player.serialize());
        return {
            id: this.id,
            players: serializedPlayers,
            status: this.getStatus(),
            winnerId: this.getWinnerId()
        };
    }
}
exports.GameCore = GameCore;
