// pages/api/socket.js
import { Server } from 'socket.io';

export default (req, res) => {
    if (req.method === 'GET') {
        const io = new Server(res.socket.server);
        io.on('connection', (socket) => {
            console.log('New client connected');

            socket.on('message', (msg) => {
                console.log(msg);
                socket.emit('message', 'Message received');
            });
        });

        res.end();
    } else {
        res.status(405).end();
    }
};
