import { useEffect } from "react";

export default function useOnlineUsers(socket, user, setOnlineUsers) {
    useEffect(() => {
        if (!socket || !user) return;

        socket.emit('join', user.username);

        socket.on('onlineUsers', (usernames) => setOnlineUsers(usernames));
        socket.on('userConnected', (username) =>
            setOnlineUsers(prev => [...new Set([...prev, username])])
        );
        socket.on('userDisconnected', (username) =>
            setOnlineUsers(prev => prev.filter(u => u !== username))
        );

        return () => {
            socket.off('onlineUsers');
            socket.off('userConnected');
            socket.off('userDisconnected');
        };
    }, [socket, user, setOnlineUsers]);
}