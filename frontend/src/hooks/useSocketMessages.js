import { useEffect } from "react";

export default function useSocketMessages(socket, user, selectedContact, setChatHistory, setMessages) {
    useEffect(() => {
        if (!socket || !user) return;

        const messageHandler = ({ from, to, text }) => {
            const contact = from === user.username ? to : from;

            setChatHistory(prev => ({
                ...prev,
                [contact]: [...(prev[contact] || []), { from, to, text }],
            }));

            if (contact === selectedContact) {
                setMessages(prev => [...prev, { from, to, text }]);
            }
        };

        socket.on('message', messageHandler);

        return () => socket.off('message', messageHandler);
    }, [socket, user, selectedContact, setChatHistory, setMessages]);
}