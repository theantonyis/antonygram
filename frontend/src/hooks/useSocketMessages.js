import { useEffect } from "react";
import { toast } from 'react-toastify';
import { decrypt } from "@utils/aes256";


export default function useSocketMessages(socket, user, selectedContactRef, setChatHistory, setMessages, setUnreadCounts) {
    useEffect(() => {
        if (!socket || !user) return;

        const messageHandler = (incoming) => {
            const {from, to, text, timestamp, senderAvatar, replyTo, clientId} = incoming;
            const contact = from === user.username ? to : from;
            const isOwn = from === user.username;

            let decryptedText;
            if (!text || incoming.deleted) {
                decryptedText = "";
            } else {
                try {
                    decryptedText = decrypt(text);
                } catch (err) {
                    decryptedText = "[Could not decrypt message]";
                    console.error('Failed to decrypt message', err);
                    return;
                }
            }

            // Look up replied-to message in local chat history (by _id)
            let replyToFull = null;
            if (replyTo && typeof replyTo === 'string') {
                const chat = JSON.parse(JSON.stringify(window.chatHistory || {}));
                const arr = chat[contact] || [];
                const found = arr.find(msg => msg._id === replyTo) || null;
                if (found) {
                    replyToFull = {
                        ...found,
                        text: found.text ? decrypt(found.text) : found.text,
                    };
                }
            } else if (typeof replyTo === 'object' && replyTo !== null) {
                replyToFull = {
                    ...replyTo,
                    text: replyTo.text ? decrypt(replyTo.text) : replyTo.text,
                };
            }

            // Normalize for MessageList fields
            const formattedMessage = {
                senderAvatar: senderAvatar || (isOwn ? user.avatar : null),
                text: decryptedText,
                timestamp: timestamp || new Date(),
                from,
                to,
                ...(incoming._id && {_id: incoming._id}),
                ...(replyTo && {replyTo: replyToFull || replyTo}),
                ...(clientId && {clientId}),
            };

            setChatHistory(prev => ({
                ...prev,
                [contact]: [
                    ...(prev[contact] || []).filter(msg =>
                        !(clientId && msg.clientId && msg.clientId === clientId)
                    ),
                    formattedMessage
                ]
            }));

            if (contact === selectedContactRef.current?.username) {
                setMessages(prev => {
                    // Remove any with matching clientId before adding
                    const filtered = prev.filter(msg =>
                        !(clientId && msg.clientId && msg.clientId === clientId)
                    );
                    // Standard duplicate detection as a fallback
                    const alreadyExists = filtered.some(msg =>
                        (msg._id && formattedMessage._id && msg._id === formattedMessage._id) ||
                        (!msg._id && !formattedMessage._id &&
                            msg.timestamp === formattedMessage.timestamp &&
                            msg.from === formattedMessage.from &&
                            msg.text === formattedMessage.text)
                    );
                    if (alreadyExists) return filtered;
                    return [...filtered, formattedMessage];
                });
            } else if (!isOwn) {
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
    }, [socket, user, setChatHistory, setMessages, setUnreadCounts, selectedContactRef]);
}
