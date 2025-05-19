import { useEffect, useState } from "react";
import io from "socket.io-client";
import { getToken } from "@utils/getToken";

export default function useSocket() {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL, { auth: { token } });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, []);

    return socket;
}