import { Server } from 'socket.io';
import type { NextApiRequest } from 'next';
import type { Server as HTTPServer } from 'http';
import type { Socket } from 'socket.io';

let io: Server | undefined;

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server as HTTPServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });
    res.socket.server.io = io;

    io.on('connection', (socket: Socket) => {
      // Your socket event handlers here
      socket.on('message', (msg) => {
        socket.broadcast.emit('message', msg);
      });
    });
  }
  res.end();
}
