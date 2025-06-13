// utils/chatHandlers.js

import { v4 as uuidv4 } from 'uuid';
import api from '@utils/axios';
import { encrypt } from '@utils/aes256';
import { toast } from 'react-toastify';

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
 */
export const handleSend = async ({
    input,
    selectedContact,
    user,
    socket,
    setMessages,
    setChatHistory,
    setInput,
    replyTo,
    file,
}) => {
    if ((!input.trim() && !file) || !selectedContact) return;

    let to, isGroup = false;

    // Distinguish between user and group object
    if (selectedContact.groupId || selectedContact.groupName) {
        // It's a group!
        to = selectedContact.groupId || selectedContact.groupName;
        isGroup = true;
    } else {
        // Fallback: user
        to = typeof selectedContact === 'string' ? selectedContact : selectedContact.username;
    }

    try {
        const encryptedText = input.trim() ? encrypt(input.trim()) : '';
        const clientId = uuidv4();

        let replyToObj = null;
        if (replyTo && replyTo._id) {
            replyToObj = {
                _id: replyTo._id,
                from: replyTo.from,
                text: replyTo.text,
                senderAvatar: replyTo.senderAvatar,
                deleted: replyTo.deleted,
                // Make sure to include file info if the message being replied to has a file
                file: replyTo.file ? {
                    blobName: replyTo.file.blobName,
                    name: replyTo.file.name,
                    type: replyTo.file.type,
                    size: replyTo.file.size
                } : undefined
            };
        }

        const message = {
            from: user.username,
            to,
            text: encryptedText,
            timestamp: new Date().toISOString(),
            clientId,
            isGroup,
            senderAvatar: user.avatar,
            _text: input.trim(),
            replyTo: replyToObj,
            file
        };

        const key = isGroup ? to : (selectedContact.username || selectedContact);

        // Add to chat history with temporary clientId
        setChatHistory(prev => ({
            ...prev,
            [key]: [...(prev[key] || []), message]
        }));

        // Update current messages view with temporary message
        setMessages(prev => [...prev, message]);

        // Send via socket
        socket.emit('message', {
            ...message,
            replyTo: replyToObj
        });

        setInput('');
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
export const selectContact = ({
    contact,
    setSelectedContact,
    setMessages,
    chatHistory,
    socket,
    user
}) => {
    setSelectedContact(contact);
    if (socket && user && contact) {
        let joinTarget;
        if (contact.groupId || contact.groupName) {
            joinTarget = contact.groupId || contact.groupName;
            socket.emit('joinGroup', { groupId: joinTarget });
        } else {
            joinTarget = typeof contact === 'string' ? contact : contact.username;
            socket.emit('joinRoom', { withUser: joinTarget });
        }

    }
    const key = contact.groupId || contact.groupName || contact.username || contact;
    setMessages(chatHistory[key] || []);
};

/**
 * Handles deleting a single message from both UI and backend.
 * @param {object} params
 * @param {object} params.msgToDelete - The message object to delete.
 * @param {object} params.selectedContact - Currently selected contact.
 * @param {function} params.setChatHistory - State setter for chat history.
 * @param {function} params.setMessages - State setter for messages.
 */
export const handleDeleteMessage = async ({
    msgToDelete,
    selectedContact,
    setChatHistory,
    setMessages
}) => {
    if (!selectedContact || !msgToDelete || !msgToDelete._id) return;

    try {
        await api.delete(`${backendURL}/api/messages/single/${msgToDelete._id}`);
    } catch (err) {
        // Optionally show notification
        console.error('Failed to delete message in backend', err);
    }

    const key = selectedContact.groupId || selectedContact.username || selectedContact;

    setChatHistory(prev => {
        const current = prev[key] || [];
        return {
            ...prev,
            [key]: current.map(msg => {
                if (msg._id === msgToDelete._id) {
                    return { ...msg, deleted: true, text: '' };
                }

                // Also update replies to this message
                if (msg.replyTo && msg.replyTo._id === msgToDelete._id) {
                    return {
                        ...msg,
                        replyTo: {
                            ...msg.replyTo,
                            deleted: true,
                            text: ''
                        }
                    };
                }
                return msg;
            })
        };
    });

    // Update current messages view with similar logic
    setMessages(prev =>
        prev.map(msg => {
            if (msg._id === msgToDelete._id) {
                return { ...msg, deleted: true, text: '' };
            }

            if (msg.replyTo && msg.replyTo._id === msgToDelete._id) {
                return {
                    ...msg,
                    replyTo: {
                        ...msg.replyTo,
                        deleted: true,
                        text: ''
                    }
                };
            }
            return msg;
        })
    );
};

/**
 * Sets a message to reply to (i.e., update the replyTo state).
 * @param {object} params
 * @param {object} params.msg - The message being replied to.
 * @param {function} params.setReplyTo - State setter for replyTo.
 */
export const handleReplyMessage = ({
    msg,
    setReplyTo
}) => {
    const replyData = {
        _id: msg._id,
        from: msg.from,
        text: msg.text,
        senderAvatar: msg.senderAvatar,
        deleted: msg.deleted,
        // Include file information if available
        file: msg.file ? {
            blobName: msg.file.blobName,
            name: msg.file.name,
            type: msg.file.type,
            size: msg.file.size
        } : undefined
    };

    setReplyTo(replyData);
};

/**
 * Handles adding a member to a group.
 * @param {object} params
 * @param {string} params.groupId - The group ID to add to.
 * @param {string} params.username - The username of the member to add.
 * @param {function} params.setGroup - State setter for the group (updates members).
 */
export const handleAddGroupMember = async ({
    groupId,
    username,
    setGroup,
}) => {
    if (!username || !groupId) return;
    try {
        const res = await api.post(`${backendURL}/api/groups/${groupId}/add-member`, { username });
        if (setGroup && typeof setGroup === 'function') {
            setGroup(res.data.group);
        }
    } catch (error) {
        console.error('Failed to add member:', error.response?.data || error.message);
        alert(error.response?.data?.error || 'Failed to add member');
    }
};

/**
 * Handles removing a member from a group.
 * @param {object} params
 * @param {string} params.groupId - The group ID to remove from.
 * @param {string} params.username - The username of the member to remove.
 * @param {function} params.setGroup - State setter for the group (updates members).
 */
export const handleRemoveGroupMember = async ({
    groupId,
    username,
    setGroup,
}) => {
    if (!username || !groupId) return;
    try {
        const res = await api.post(`${backendURL}/api/groups/${groupId}/remove-member`, { username });
        if (setGroup && typeof setGroup === 'function') {
            setGroup(res.data.group);
        }
    } catch (error) {
        console.error('Failed to remove member:', error.response?.data || error.message);
        alert(error.response?.data?.error || 'Failed to remove member');
    }
};

export const handleDeleteGroup = async ({ groupId, setGroup, onGroupDeleted }) => {
    try {
        await api.delete(`${backendURL}/api/groups/${groupId}`);

        // Reset local state
        if (setGroup) setGroup(null);

        if (onGroupDeleted) onGroupDeleted(groupId);

        toast.success('Group deleted successfully');
    } catch (err) {
        console.error('Delete group error:', err);
        alert(err.response?.data?.error || err.message || 'Failed to delete group');
    }
};

export const handleGroupDeleted = ({
   groupId,
   selectedContact,
   refreshGroupsCallback,
   setSelectedContact
}) => {
    if (!groupId || typeof refreshGroupsCallback !== 'function') return;

    refreshGroupsCallback();

    if (selectedContact?.groupId === groupId && typeof setSelectedContact === 'function') {
        setSelectedContact(null);
    }
};

export const handleUserProfileUpdate = async ({
  name,
  surname,
  file,
  user,
  fileInputRef,
  setLoading,
  setError,
  onHide,
  onUserUpdate
}) => {
    setError('');
    setLoading(true);

    try {
        let avatarUrl = user?.avatar;

        // If there's a new file, upload it first
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            try {
                const uploadResponse = await api.post(`${backendURL}/api/files/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (uploadResponse.data && uploadResponse.data.file) {
                    const viewResponse = await api.get(`${backendURL}/api/files/view/${uploadResponse.data.file.blobName}`);
                    avatarUrl = viewResponse.data.url;
                }
            } catch (err) {
                console.error('Avatar upload failed:', err);
                setError('Failed to upload avatar');
                setLoading(false);
                return;
            }
        }

        try {
            await api.put(`${backendURL}/api/users/update-profile`, {
                name,
                surname,
                avatarUrl: file ? avatarUrl : undefined,
            });
        } catch (err) {
            console.error('Profile update failed:', err);
            setError(err.response?.data?.message || 'Failed to update profile');
            setLoading(false);
            return;
        }

        // Call the callback with updated user
        onUserUpdate({
            ...user,
            name,
            surname,
            avatar: avatarUrl
        });

        if (fileInputRef && fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        onHide();
    } catch (err) {
        console.error('Profile update error:', err);
        setError('Failed to update profile');
    } finally {
        setLoading(false);
    }
};

export const handleUserUpdate = (updatedUser, user, setMessages) => {
    if (user) {
        Object.assign(user, {
            name: updatedUser.name,
            surname: updatedUser.surname,
            avatar: updatedUser.avatar
        });
    }

    // Update messages with new avatar if changed
    if (updatedUser.avatar !== user.avatar) {
        setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.from === user.username) {
                return {
                    ...msg,
                    senderAvatar: updatedUser.avatar
                };
            }
            return msg;
        }));
    }

    // Update localStorage to persist changes between reloads
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({
        ...storedUser,
        name: updatedUser.name,
        surname: updatedUser.surname,
        avatar: updatedUser.avatar
    }));
}


