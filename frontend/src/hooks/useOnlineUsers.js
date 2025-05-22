import { useEffect } from "react";

export default function useOnlineUsers(socket, user, setOnlineUsers) {
    useEffect(() => {
        if (!socket || !user) return;

        const handleOnlineUsers = (onlineUsernames) => {
            setOnlineUsers(onlineUsernames);
        };

        socket.on('online_users', handleOnlineUsers);

        return () => socket.off('online_users', handleOnlineUsers);
    }, [socket, user, setOnlineUsers]);
}
