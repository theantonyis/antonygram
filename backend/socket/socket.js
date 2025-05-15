const setupSocket = (io) => {
    io.on('connection', (socket) => {
        console.log('Socket connected');

        socket.on('message', (msg) => {
            console.log('Received:', msg);
            socket.emit('message', 'Message received');
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    });
};

export default setupSocket;
