// utils/chatHandlers.js

import api from '@utils/axios';

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Handles user logout.
 * @param {object} router - Next.js router for navigation.
 */
export const handleLogout = (router) => {
    document.cookie = 'token=; Max-Age=0; path=/';
    router.push('/login');
};

/**
 * Handles sending a message.
 * @param {object} params
 * @param {string} params.input - Message string.
 * @param {object} params.selectedContact - Selected contact object/username.
 * @param {object} params.user - Current user object.
 * @param {object} params.socket - Socket.io-client instance.
 * @param {function} params.setInput - State setter for input.
 * @param {function} params.setMessages - State setter for messages.
 * @param {function} params.setChatHistory - State setter for chat history.
 */
export const handleSend = async ({
    input,
    selectedContact,
    user,
    socket,
    setInput,
    setMessages,
    setChatHistory,
}) => {
    if (!input.trim() || !selectedContact) return;

    const to = typeof selectedContact === 'string' ? selectedContact : selectedContact.username;

    // Create a message object similar to what's returned by backend (add timestamp)
    const now = new Date();
    const message = {
        from: user.username,
        to,
        text: input.trim(),
        timestamp: now.toISOString()
    };

    try {
        socket.emit('message', message);
        setInput('');

        // Optimistically add message to UI
        setMessages(prev => [...(Array.isArray(prev) ? prev : []), message]);
        setChatHistory(prev => ({
            ...prev,
            [to]: [...(prev[to] || []), message]
        }));

    } catch (err) {
        console.error('Failed to send message', err);
    }
};


/**
 * Handles clearing the chat history for a contact.
 * @param {object} params
 * @param {object} params.contact - The contact to clear.
 * @param {object} params.selectedContact - Currently selected contact.
 * @param {function} params.setChatHistory - State setter for chat history.
 * @param {function} params.setMessages - State setter for messages.
 */
export const handleClear = async ({ contact, selectedContact, setChatHistory, setMessages }) => {
    if (!contact) return;

    try {
        await api.delete(`${backendURL}/api/messages/${typeof contact === 'string' ? contact : contact.username}`);
        setChatHistory(prev => ({ ...prev, [contact.username || contact]: [] }));

        if ((contact.username || contact) === (selectedContact?.username || selectedContact)) {
            setMessages([]);
        }
    } catch (err) {
        console.error('Failed to clear chat', err);
        alert('Failed to clear chat');
    }
};

/**
 * Handles deleting a contact.
 * @param {object} params
 * @param {object|string} params.contact - The contact to delete.
 * @param {object|string} params.selectedContact - Currently selected contact.
 * @param {function} params.setContactsList - State setter for contacts list.
 * @param {function} params.setChatHistory - State setter for chat history.
 * @param {function} params.setSelectedContact - State setter for selected contact.
 * @param {function} params.setMessages - State setter for messages.
 */
export const handleDeleteContact = async ({
    contact,
    selectedContact,
    setContactsList,
    setChatHistory,
    setSelectedContact,
    setMessages
}) => {
    if (!contact) return;

    const username = contact.username || contact;
    try {
        // First, delete all chat messages with this contact on the backend
        await api.delete(`${backendURL}/api/messages/${username}`);
        // Then, delete the contact from backend
        await api.delete(`${backendURL}/api/contacts/${username}`);

        // Remove from contacts list state
        setContactsList(prev => prev.filter(c => c.username !== username));

        // Remove chat history locally
        setChatHistory(prev => {
            const newHistory = { ...prev };
            delete newHistory[username];
            return newHistory;
        });

        // If this contact was the selected one, clear selection & messages
        if ((selectedContact?.username || selectedContact) === username) {
            setSelectedContact(null);
            setMessages([]);
        }
    } catch (error) {
        console.error('Failed to delete contact', error);
        alert('Failed to delete contact');
    }
};

/**
 * Handles adding a new contact.
 * @param {object} params
 * @param {object} params.e - The form event.
 * @param {string} params.search - Input value for searching/adding contact.
 * @param {function} params.setContactsList - State setter for contacts list.
 * @param {function} params.setSelectedContact - State setter for selected contact.
 * @param {function} params.setSearch - State setter for search input.
 */
export const handleAddContact = async ({ e, search, setContactsList, setSelectedContact, setSearch }) => {
    e.preventDefault();
    if (!search.trim()) return;

    try {
        const res = await api.post(`${backendURL}/api/contacts/add`, { username: search.trim() });
        setContactsList(res.data.contacts);

        // Find the newly added contact as object and set it
        const newContact =
            Array.isArray(res.data.contacts)
                ? res.data.contacts.find((c) => c.username === search.trim())
                : { username: search.trim() };

        setSelectedContact(newContact); // ← Always set as object!
        setSearch('');
    } catch (error) {
        console.error('Failed to add contact:', error.response?.data || error.message);
        alert(error.response?.data?.error || 'Failed to add contact');
    }
};

/**
 * Handles selecting a contact.
 * @param {object} params
 * @param {object} params.contact - Contact to select.
 * @param {object} params.setSelectedContact - State setter for selected contact.
 * @param {object} params.setMessages - State setter for messages.
 * @param {object} params.chatHistory - Full chat history object.
 * @param {object} params.socket - Socket.io-client instance.
 * @param {object} params.user - Current user object.
 */
export const selectContact = ({ contact, setSelectedContact, setMessages, chatHistory, socket, user }) => {
    setSelectedContact(contact);
    setMessages(chatHistory[contact?.username || contact] || []);

    if (socket && user?.username) {
        socket.emit('joinRoom', { withUser: contact?.username || contact });
    }
};