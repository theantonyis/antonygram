import {useEffect} from "react";
import api from "@utils/axios";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function useChatHistory(selectedContact, chatHistory, setMessages, setChatHistory) {
    useEffect(() => {
        if (!selectedContact) return;

        // Use username string for lookup regardless of selectedContact type
        const contactKey = selectedContact.groupId ||
            (typeof selectedContact === 'string' ? selectedContact : selectedContact.username);


        if (chatHistory[contactKey]) {
            setMessages(chatHistory[contactKey]);
            return;
        }

        const fetchMessages = async () => {
            try {
                // For groups, use a different endpoint
                if (selectedContact.groupId) {
                    // Create group messages endpoint
                    const res = await api.get(`${backendURL}/api/messages/groups/${selectedContact.groupId}`);
                    setChatHistory(prev => ({ ...prev, [contactKey]: res.data.messages || [] }));
                    setMessages(res.data.messages || []);
                } else {
                    // For direct messages, use the existing endpoint
                    const username = typeof selectedContact === 'string' ? selectedContact : selectedContact.username;
                    const res = await api.get(`${backendURL}/api/messages/${username}`);
                    setChatHistory(prev => ({ ...prev, [contactKey]: res.data.messages }));
                    setMessages(res.data.messages);
                }
            } catch (err) {
                console.error('Failed to fetch messages', err);
                setMessages([]);
            }
        };
        fetchMessages();
    }, [selectedContact, chatHistory, setMessages, setChatHistory]);
}
