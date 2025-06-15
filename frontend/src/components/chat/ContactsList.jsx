import React, {useState, useRef, useEffect} from 'react';
import { ListGroup, Form, Button, Dropdown, Badge } from 'react-bootstrap';
import { UserMinus, Plus, MoreVertical, Trash2, Users } from 'lucide-react';
import Avatar from '../common/Avatar';
import dayjs from 'dayjs';
import api from "@utils/axios.js";
import useGroups from '@hooks/useGroups.js';
import GroupCreationForm from './GroupForm';
import useSocket from '@hooks/useSocket';

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const ContactsList = ({
    user,
    contacts,
    selectedContact,
    unreadCounts = {},
    addContactInput,
    setAddContactInput,
    onAddContact,
    onSelectContact,
    onClearChat,
    onDeleteContact,
    refreshGroups,
    onGroupDeleted,
}) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showPreview, setShowPreview] = useState(true); // control preview visibility
    const inputGroupRef = useRef(null);
    const [showGroupForm, setShowGroupForm] = useState(false);

    const { groups, refreshGroups: doRefreshGroups } = useGroups();
    const socket = useSocket();

    // Add state for searched user(s) not yet in contacts
    const [externalSearchResult, setExternalSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Contacts filter for local search
    const previewResults = addContactInput && showPreview
        ? contacts.filter(
            contact =>
                contact.username.toLowerCase().includes(addContactInput.toLowerCase())
        )
        : [];

    // EFFECT: Query backend if no local result, and input is present
    useEffect(() => {
        if (
            addContactInput &&
            showPreview &&
            previewResults.length === 0
        ) {
            setSearchLoading(true);
            api
                .get(`${backendURL}/api/contacts/search?q=${encodeURIComponent(addContactInput)}`)
                .then(res => {
                    if (res.data.users && res.data.users.length > 0) {
                        setExternalSearchResult(res.data.users[0]);
                    } else {
                        setExternalSearchResult(null);
                    }
                })
                .catch(() => setExternalSearchResult(null))
                .finally(() => setSearchLoading(false));
        } else {
            setExternalSearchResult(null);
            setSearchLoading(false);
        }
    }, [addContactInput, showPreview, previewResults.length]);

    useEffect(() => {
        if (!socket || !user) return;
        // Listen for group-related events
        const refresh = () => {
            // Use the correct function based on what you have
            if (typeof refreshGroups === 'function') {
                refreshGroups();
            } else if (typeof doRefreshGroups === 'function') {
                doRefreshGroups();
            }
        };

        socket.on('groupCreated', refresh);
        socket.on('groupUpdated', refresh);
        socket.on('groupDeleted', refresh);
        socket.on('addedToGroup', refresh);
        socket.on('removedFromGroup', refresh);

        socket.on('message', (msg) => {
            // Make sure selectedContact exists before checking its properties
            if (!selectedContact) {
                // If no contact is selected, always increment unread
                const messageTargetId = msg.isGroup ? msg.to : (msg.from === user.username ? msg.to : msg.from);

                // Don't increment unread for messages sent by the current user
                if (msg.from !== user.username) {
                    setUnreadCounts(prev => ({
                        ...prev,
                        [messageTargetId]: (prev[messageTargetId] || 0) + 1
                    }));
                }
                return;
            }

            const currentId = selectedContact.groupId || selectedContact.username;
            const messageTargetId = msg.isGroup ? msg.to : (msg.from === user.username ? msg.to : msg.from);

            // If message isn't for current conversation and isn't from current user
            if (messageTargetId !== currentId && msg.from !== user.username) {
                setUnreadCounts(prev => ({
                    ...prev,
                    [messageTargetId]: (prev[messageTargetId] || 0) + 1
                }));
            }
        });

        return () => {
            socket.off('groupCreated', refresh);
            socket.off('groupUpdated', refresh);
            socket.off('groupDeleted', refresh);
            socket.off('addedToGroup', refresh);
            socket.off('removedFromGroup', refresh);
            socket.off('message');
        };
    }, [socket, doRefreshGroups, refreshGroups, selectedContact, user]);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Welcome, {user?.username || 'Guest'}!</h4>
            </div>

            <div className="mb-3 d-flex flex-column">
                {/* --- Input + Search Preview container --- */}
                <div className="position-relative mb-2" ref={inputGroupRef}>
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Add new contact..."
                            value={addContactInput}
                            onChange={(e) => {
                                setAddContactInput(e.target.value);
                                setShowPreview(true);
                            }}
                            onFocus={() => setShowPreview(true)}
                            onBlur={() => setTimeout(() => setShowPreview(false), 100)}
                            onClick={() => {
                                if (inputGroupRef.current) {
                                    inputGroupRef.current.querySelector('input').focus();
                                }
                            }}
                            className="me-2"
                            autoComplete="off"
                        />
                        <Button variant="outline-primary" onClick={onAddContact} className="me-2" title="Add Contact">
                            <Plus size={20} />
                        </Button>
                        <Button
                            variant="outline-success"
                            onClick={() => setShowGroupForm(true)}
                            title="Create Group"
                        >
                            <Users size={20} />
                        </Button>
                    </div>

                    {/* Preview is absolutely positioned relative to this container */}
                    {addContactInput && showPreview && (
                        <ListGroup
                            style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                width: '100%',
                                zIndex: 9999,
                                backgroundColor: 'white',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                borderRadius: '0.375rem',
                                overflow: 'hidden',
                            }}
                        >
                            {previewResults.length > 0 ? (
                                previewResults.map(contact => (
                                    <ListGroup.Item
                                        key={contact.username}
                                        action={false}
                                        className="d-flex align-items-center justify-content-between"
                                        style={{
                                            background: 'var(--bs-light)',
                                            cursor: 'not-allowed',
                                            opacity: 0.65
                                        }}
                                    >
                                        <div className="d-flex align-items-center">
                                            <Avatar avatar={contact.avatar} size={24} />
                                            <span className="ms-2">{contact.username}</span>
                                        </div>
                                        <span className="badge bg-success ms-3" title="Already in contacts">Added</span>
                                    </ListGroup.Item>
                                ))
                            ) : searchLoading ? (
                                <ListGroup.Item disabled>Searching...</ListGroup.Item>
                            ) : externalSearchResult ? (
                                <ListGroup.Item
                                    action
                                    onMouseDown={() => {
                                        setAddContactInput(externalSearchResult.username);
                                        setShowPreview(false);
                                    }}
                                    className="d-flex align-items-center"
                                    style={{ cursor: 'pointer', background: 'white' }}
                                >
                                    <Avatar avatar={externalSearchResult.avatar} size={24} />
                                    <span className="ms-2">{externalSearchResult.username}</span>
                                </ListGroup.Item>
                            ) : (
                                <ListGroup.Item disabled>No matching users found</ListGroup.Item>
                            )}
                        </ListGroup>
                    )}
                </div>
                {/* --- Contacts list is rendered after preview --- */}
                <ListGroup className="bg-white z-10">
                    {/* Groups section */}
                    {groups.map(group => {
                        const isSelected = selectedContact?.groupId === group._id;
                        const unread = unreadCounts[group._id] || 0;

                        return (
                            <ListGroup.Item
                                as="div"
                                key={group._id}
                                action
                                active={isSelected}
                                onClick={() => onSelectContact({ groupId: group._id, ...group })}
                                className="d-flex justify-content-between align-items-center cursor-pointer"
                            >
                                <div className="d-flex align-items-center">
                                    {/* Use group avatar/icon or Users icon */}
                                    <Avatar avatar={group.avatar} size={32} fallbackIcon={<Users size={28} />} />
                                    <div className="ms-2">
                                        <div>
                                            {group.name}
                                            {unread > 0 && (
                                                <span className="badge bg-danger ms-2" title={`${unread} unread`}>
                                                    {unread}
                                                </span>
                                            )}
                                        </div>
                                        <small className={isSelected ? 'fw-bold text-white' : 'text-muted'}>
                                            {Array.isArray(group.members) ? group.members.length : 0} member
                                            {Array.isArray(group.members) && group.members.length === 1 ? '' : 's'}
                                        </small>
                                    </div>
                                </div>
                                {/* Optional: Add group dropdown for actions like "Leave Group" */}
                            </ListGroup.Item>
                        );
                    })}

                    {contacts.map((contact) => {
                        const isOnline = contact.isOnline;
                        const isSelected = selectedContact?.username === contact.username;
                        const unread = unreadCounts[contact.username] || 0;

                        return (
                            <ListGroup.Item
                                as="div"
                                key={contact.username}
                                action
                                active={selectedContact?.username === contact.username}
                                onClick={() => onSelectContact({
                                    type: 'contact',
                                    id: contact.username,
                                    username: contact.username,
                                    avatar: contact.avatar,
                                    lastSeen: contact.lastSeen,
                                    isOnline: contact.isOnline
                                })}
                                className="d-flex justify-content-between align-items-center cursor-pointer"
                            >
                            <div className="d-flex align-items-center">
                                    <Avatar avatar={contact.avatar} size={32} />
                                    <div className="ms-2">
                                        <div>
                                            {contact.username}
                                            {unread > 0 && (
                                                <span className="badge bg-danger ms-2" title={`${unread} unread`}>
                                                    {unread}
                                                </span>
                                            )}
                                        </div>
                                        <small
                                            className={
                                                isOnline
                                                    ? 'online-status'
                                                    : isSelected
                                                    ? 'text-white fw-bold'
                                                    : 'text-muted'
                                            }
                                        >
                                            {isOnline
                                                ? 'Online'
                                                : `Last seen ${dayjs(contact.lastSeen).format('DD/MM/YYYY HH:mm')}`}
                                        </small>
                                    </div>
                                </div>

                                <Dropdown
                                    align="end"
                                    show={openDropdown === contact.username}
                                    onToggle={(isOpen) => {
                                        setOpenDropdown(isOpen ? contact.username : null);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <Dropdown.Toggle
                                        variant="link"
                                        bsPrefix="p-0 border-0 custom-dropdown-toggle"
                                        id={`dropdown-${contact.username}`}
                                        style={{
                                            color: isSelected && !isOnline ? 'text-white' : 'inherit',
                                        }}
                                    >
                                        <MoreVertical size={20} />
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onClearChat(contact);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            <Trash2 size={16} className="me-2" style={{ color: 'red' }} />
                                            Clear Chat
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteContact(contact);
                                                setOpenDropdown(null);
                                            }}
                                        >
                                            <UserMinus size={16} className="me-2" style={{ color: 'red' }} />
                                            Delete Contact
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>
                            </ListGroup.Item>
                        );
                    })}
                </ListGroup>
            </div>

            {/* Render group creation form modal */}
            <GroupCreationForm
                show={showGroupForm}
                onHide={() => setShowGroupForm(false)}
                contacts={contacts}
                onGroupCreated={doRefreshGroups}
                user={user}
            />
        </div>
    );
};

export default ContactsList;
