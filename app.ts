import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { GameServer } from './src/GameServer';

const port = Number(process.env.port) || 2567;

const app = express();
app.use(cors());

app.get('/test', (req, res) => res.send({ ok: true }));

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:3000',
    credentials: true
  }
});

const gameServer = new GameServer(io);
gameServer.onCreate();

httpServer.listen(port, () => {
  console.log(`Listening on ${port}`);
});
