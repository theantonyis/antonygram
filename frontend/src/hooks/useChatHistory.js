import { useEffect } from "react";
import api from '@/utils/axios';

export default function useChatHistory(selectedContact, chatHistory, setMessages, setChatHistory) {
    useEffect(() => {
        if (!selectedContact) return;

        if (chatHistory[selectedContact]) {
            setMessages(chatHistory[selectedContact]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/${selectedContact}`);
                setChatHistory(prev => ({ ...prev, [selectedContact]: res.data.messages }));
                setMessages(res.data.messages);
            } catch (err) {
                console.error('Failed to fetch messages', err);
                setMessages([]);
            }
        };
        fetchMessages();
    }, [selectedContact, chatHistory, setMessages, setChatHistory]);
}