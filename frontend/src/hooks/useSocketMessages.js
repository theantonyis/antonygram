import { useEffect } from "react";
import { toast } from 'react-toastify';
import { decrypt } from "@utils/aes256";


export default function useSocketMessages(socket, user, selectedContactRef, setChatHistory, setMessages, unreadCounts, setUnreadCounts) {
    useEffect(() => {
        if (!socket || !user) return;

        const messageHandler = (incoming) => {
            const {from, to, text, timestamp, senderAvatar, replyTo, clientId} = incoming;
            const contact = from === user.username ? to : from;
            const isOwn = from === user.username;
            const isGroup = incoming.isGroup || false;
            const contactKey = isGroup ? to : contact;

            // Normalize for MessageList fields
            const formattedMessage = {
                ...incoming,
                senderAvatar: senderAvatar || (isOwn ? user.avatar : null),
                timestamp: timestamp || new Date(),
            };

            setChatHistory(prev => {
                const existingMessages = prev[contactKey] || [];

                // Filter out any temporary messages with matching clientId
                const filteredMessages = clientId
                    ? existingMessages.filter(msg => msg.clientId !== clientId)
                    : existingMessages;

                return {
                    ...prev,
                    [contactKey]: [...filteredMessages, formattedMessage]
                };
            });

            const selectedContact = selectedContactRef.current;
            const isSelected = selectedContact &&
                (isGroup ?
                    selectedContact.groupId === to :
                    selectedContact.username === contact);

            if (isSelected) {
                setMessages(prev => {
                    // Remove temporary messages with the same clientId if exists
                    const filtered = prev.filter(msg =>
                        !(clientId && msg.clientId === clientId)
                    );

                    return [...filtered, formattedMessage];
                });
            } else if (!isOwn) {
                // Update unread counts for incoming messages
                setUnreadCounts(prev => ({
                    ...prev,
                    [contact]: (prev[contact] || 0) + 1
                }));
            }
        };

        socket.on('message', messageHandler);

        return () => socket.off('message', messageHandler);
    }, [socket, user, setChatHistory, setMessages, setUnreadCounts, selectedContactRef]);
}
