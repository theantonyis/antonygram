import { useEffect } from "react";
import { toast } from 'react-toastify';
import { decrypt } from "@utils/aes256";

export default function useSocketMessages(socket, user, selectedContactRef, setChatHistory, setMessages, unreadCounts, setUnreadCounts) {
    useEffect(() => {
        if (!socket || !user) return;

        const messageHandler = (incoming) => {
            const { from, to, text, timestamp, senderAvatar, replyTo, clientId, file } = incoming;
            const isOwn = from === user.username;
            const isGroup = incoming.isGroup || false;

            const contactKey = isGroup ? to : (from === user.username ? to : from);

            const formattedMessage = {
                ...incoming,
                senderAvatar: senderAvatar || (isOwn ? user.avatar : null),
                timestamp: timestamp || new Date(),
                file
            };

            setChatHistory(prev => {
                const existingMessages = prev[contactKey] || [];
                const filteredMessages = clientId
                    ? existingMessages.filter(msg => msg.clientId !== clientId)
                    : existingMessages;
                return {
                    ...prev,
                    [contactKey]: [...filteredMessages, formattedMessage]
                };
            });

            const selectedContact = selectedContactRef.current;
            let selectedKey = null;

            if (selectedContact) {
                if (selectedContact.groupId) {
                    selectedKey = selectedContact.groupId;
                } else if (selectedContact.username) {
                    selectedKey = selectedContact.username;
                }
            }

            if (selectedContact && selectedKey === contactKey) {
                setMessages(prev => {
                    const filtered = clientId ? prev.filter(msg => msg.clientId !== clientId) : prev;
                    return [...filtered, formattedMessage];
                });
            } else if (!isOwn) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [contactKey]: (prev[contactKey] || 0) + 1
                }));

                toast.info(
                    isGroup
                        ? `New message in group "${incoming.groupName || to}" from ${from}`
                        : `New message from ${from}`
                );
            }
        };

        socket.on('message', messageHandler);
        return () => socket.off('message', messageHandler);
    }, [socket, user, setChatHistory, setMessages, setUnreadCounts, selectedContactRef]);
}
