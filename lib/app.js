"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const socket_io_1 = require("socket.io");
const GameServer_1 = require("./src/GameServer");
const port = Number(process.env.port) || 2567;
const app = express_1.default();
app.use(cors_1.default());
app.get('/test', (req, res) => res.send({ ok: true }));
const httpServer = http_1.createServer(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
});
const gameServer = new GameServer_1.GameServer(io);
gameServer.onCreate();
httpServer.listen(port, () => {
    console.log(`Listening on ${port}`);
});
