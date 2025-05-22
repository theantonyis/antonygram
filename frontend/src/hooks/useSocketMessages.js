import { useEffect } from "react";

export default function useSocketMessages(socket, user, selectedContact, setChatHistory, setMessages) {
    useEffect(() => {
        if (!socket || !user) return;

        const messageHandler = ({ from, to, text, timestamp, senderAvatar }) => {
            const contact = from === user.username ? to : from;
            const isOwn = from === user.username;

            // Normalize for MessageList fields
            const formattedMessage = {
                senderAvatar: senderAvatar || (isOwn ? user.avatar : null),
                text,
                timestamp: timestamp || new Date(),
                from,
                to,
            };

            setChatHistory(prev => ({
                ...prev,
                [contact]: [...(prev[contact] || []), formattedMessage],
            }));

            if (contact === selectedContact) {
                setMessages(prev => {
                    if (prev.some(msg =>
                        msg.timestamp === formattedMessage.timestamp &&
                        msg.from === formattedMessage.from &&
                        msg.text === formattedMessage.text
                    )) return prev;
                    return [...prev, formattedMessage];
                });
            }
        };

        socket.on('message', messageHandler);

        return () => socket.off('message', messageHandler);
    }, [socket, user, selectedContact, setChatHistory, setMessages]);
}
