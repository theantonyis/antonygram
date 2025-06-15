import { useEffect, useState, useCallback } from "react";
import { toast } from 'react-toastify';
import { encrypt } from "@utils/aes256";
import { v4 as uuidv4 } from 'uuid';
import api from "@utils/axios";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function useSocketMessages(socket, user, selectedContactRef, setChatHistory, setGlobalMessages, unreadCounts, setUnreadCounts) {
    const [localMessages, setLocalMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [replyTo, setReplyTo] = useState(null);

    // Fetch messages when contact changes
    useEffect(() => {
        const selectedContact = selectedContactRef.current;
        if (!selectedContact || !user) return;

        const fetchMessages = async () => {
            setLoading(true);
            try {
                let response;
                if (selectedContact.isGroup) {
                    response = await api.get(`${backendURL}/api/messages/groups/${selectedContact._id}`);
                } else {
                    response = await api.get(`${backendURL}/api/messages/${selectedContact.username}`);
                }
                const fetchedMessages = response.data.messages || [];
                setLocalMessages(fetchedMessages);
                setGlobalMessages(fetchedMessages);
            } catch (error) {
                console.error("Failed to fetch messages:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();

        // Join the appropriate room/group
        if (selectedContact.isGroup) {
            socket?.emit('joinGroup', { groupId: selectedContact._id });
        } else {
            socket?.emit('joinRoom', { withUser: selectedContact.username });
        }
    }, [selectedContactRef, user, socket, setGlobalMessages]);

    // Listen for socket events
    useEffect(() => {
        if (!socket || !user) return;

        const messageHandler = (incoming) => {
            console.log("Socket message received:", incoming);
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

            // Update global chat history
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

            // Check if this message belongs to the currently selected contact
            const selectedContact = selectedContactRef.current;
            let selectedKey = null;

            if (selectedContact) {
                selectedKey = selectedContact.groupId || selectedContact._id || selectedContact.username;
            }

            const isActiveChatSelected = selectedContact &&
                (selectedKey === contactKey ||
                    (isGroup && selectedContact._id === to) ||
                    (!isGroup && selectedContact.username === (isOwn ? to : from)));

            if (isActiveChatSelected) {
                // Update both local state and global state
                setLocalMessages(prev => {
                    const filtered = clientId ? prev.filter(msg => msg.clientId !== clientId) : prev;
                    return [...filtered, formattedMessage];
                });

                setGlobalMessages(prev => {
                    const filtered = clientId ? prev.filter(msg => msg.clientId !== clientId) : prev;
                    return [...filtered, formattedMessage];
                });
            } else if (!isOwn) {
                // Only increment unread if message is from someone else AND we're not viewing that chat
                setUnreadCounts(prev => ({
                    ...prev,
                    [contactKey]: (prev[contactKey] || 0) + 1
                }));

                // Show a notification
                toast.info(
                    isGroup
                        ? `New message in group "${incoming.groupName || to}" from ${from}`
                        : `New message from ${from}`
                );
            }
        };

        socket.on('message', messageHandler);

        return () => socket.off('message', messageHandler);
    }, [socket, user, setChatHistory, setGlobalMessages, setUnreadCounts, selectedContactRef]);

    const sendMessage = useCallback(
        (text, file = null) => {
            const selectedContact = selectedContactRef.current;
            if (!socket || !selectedContact || (!text && !file)) return;

            const clientId = uuidv4();
            const encryptedText = text ? encrypt(text) : '';
            const to = selectedContact.isGroup ? selectedContact._id : selectedContact.username;

            // Temporary message object for optimistic UI update
            const tempMessage = {
                _id: clientId,
                from: user.username,
                to,
                _text: text, // Unencrypted text for display
                text: encryptedText,
                timestamp: new Date().toISOString(),
                clientId,
                senderAvatar: user.avatar,
                isGroup: selectedContact.isGroup,
                file,
                replyTo: replyTo
            };

            // Update UI immediately
            setLocalMessages(prev => [...prev, tempMessage]);
            setGlobalMessages(prev => [...prev, tempMessage]);

            // Send to server
            socket.emit('message', {
                to,
                text: encryptedText,
                replyTo: replyTo?._id || null,
                clientId,
                isGroup: selectedContact.isGroup,
                file
            });

            // Clear reply-to state
            setReplyTo(null);
        },
        [socket, selectedContactRef, user, replyTo, setGlobalMessages]
    );

    const deleteMessage = useCallback(
        async (message) => {
            if (!message || !message._id) return;

            try {
                await api.delete(`${backendURL}/api/messages/single/${message._id}`);
                setLocalMessages(prev =>
                    prev.map(msg =>
                        msg._id === message._id ? { ...msg, deleted: true, text: '' } : msg
                    )
                );
                setGlobalMessages(prev =>
                    prev.map(msg =>
                        msg._id === message._id ? { ...msg, deleted: true, text: '' } : msg
                    )
                );
            } catch (error) {
                console.error("Failed to delete message:", error);
            }
        },
        [setGlobalMessages]
    );

    return {
        messages: localMessages,
        loading,
        replyTo,
        sendMessage,
        deleteMessage,
        replyMessage: useCallback((message) => setReplyTo(message), []),
        cancelReply: useCallback(() => setReplyTo(null), []),
        setMessages: setLocalMessages
    };
}
