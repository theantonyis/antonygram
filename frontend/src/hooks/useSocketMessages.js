import { useEffect } from "react";
import { toast } from 'react-toastify';
import { decrypt } from "@utils/aes256";


export default function useSocketMessages(socket, user, selectedContactRef, setChatHistory, setMessages, setUnreadCounts) {
    useEffect(() => {
        if (!socket || !user) return;

        const messageHandler = (incoming) => {
            const { from, to, text, timestamp, senderAvatar, replyTo} = incoming;
            const contact = from === user.username ? to : from;
            const isOwn = from === user.username;

            let decryptedText;
            try {
                decryptedText = decrypt(text);
            } catch (err) {
                decryptedText = "[Could not decrypt message]";
                console.error('Failed to decrypt message', err);
                return;
            }

            // Look up replied-to message in local chat history (by _id)
            let replyToFull = null;
            if (replyTo && typeof replyTo === 'string') {
                const chat = JSON.parse(JSON.stringify(window.chatHistory || {}));
                const arr = chat[contact] || [];
                replyToFull = arr.find(msg => msg._id === replyTo) || null;
            } else if (typeof replyTo === 'object' && replyTo !== null) {
                replyToFull = replyTo; // Already populated
            }

            // Normalize for MessageList fields
            const formattedMessage = {
                senderAvatar: senderAvatar || (isOwn ? user.avatar : null),
                text: decryptedText,
                timestamp: timestamp || new Date(),
                from,
                to,
                ...(incoming._id && { _id: incoming._id }),
                ...(replyTo && { replyTo: replyToFull || replyTo })
            };

            setChatHistory(prev => ({
                ...prev,
                [contact]: [...(prev[contact] || []), formattedMessage],
            }));

            if (contact === selectedContactRef.current?.username) {
                setMessages(prev => {
                    if (prev.some(msg =>
                        msg.timestamp === formattedMessage.timestamp &&
                        msg.from === formattedMessage.from &&
                        msg.text === formattedMessage.text
                    )) return prev;
                    return [...prev, formattedMessage];
                });
            } else if (!isOwn) {
                // Fire toast and update unread count
                toast.info(`New message from ${from}: ${text}`);
                if (setUnreadCounts) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [from]: (prev[from] || 0) + 1
                    }));
                }
            }
        };

        socket.on('message', messageHandler);

        return () => socket.off('message', messageHandler);
    }, [socket, user, setChatHistory, setMessages, setUnreadCounts]);
}
