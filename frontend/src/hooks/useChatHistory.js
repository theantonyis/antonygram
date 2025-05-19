import {useEffect} from "react";
import api from "@utils/axios";

export default function useChatHistory(selectedContact, chatHistory, setMessages, setChatHistory) {
    useEffect(() => {
        if (!selectedContact) return;

        // Use username string for lookup regardless of selectedContact type
        const username = typeof selectedContact === 'string'
            ? selectedContact
            : selectedContact.username;

        if (chatHistory[username]) {
            setMessages(chatHistory[username]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/${username}`);
                console.log('Fetched messages:', res.data.messages);

                // Don't try to get avatars for now (avoid ContactsList problem)
                setChatHistory(prev => ({ ...prev, [username]: res.data.messages }));
                setMessages(res.data.messages);
            } catch (err) {
                console.error('Failed to fetch messages', err);
                setMessages([]);
            }
        };
        fetchMessages();
    }, [selectedContact, chatHistory, setMessages, setChatHistory]);
}