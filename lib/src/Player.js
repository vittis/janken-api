"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const unique_names_generator_1 = require("unique-names-generator");
class Player {
    constructor(socket) {
        this.wins = 0;
        this.socket = socket;
        this.id = socket.id;
        this.name = unique_names_generator_1.uniqueNamesGenerator({
            dictionaries: [unique_names_generator_1.starWars]
        });
    }
    serialize() {
        return { id: this.id, name: this.name, wins: this.wins };
    }
}
exports.Player = Player;
