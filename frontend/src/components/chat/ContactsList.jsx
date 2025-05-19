import React, {useState, useRef, useEffect} from 'react';
import { ListGroup, Form, Button, Dropdown } from 'react-bootstrap';
import { UserMinus, Plus, MoreVertical, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import dayjs from 'dayjs';
import api from "@utils/axios.js";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const ContactsList = ({
    user,
    contacts,
    selectedContact,
    onlineUsers = [],
    addContactInput,
    setAddContactInput,
    onAddContact,
    onSelectContact,
    onClearChat,
    onDeleteContact
}) => {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showPreview, setShowPreview] = useState(true); // control preview visibility
    const inputGroupRef = useRef(null);

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


    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Welcome, {user?.username || 'Guest'}!</h4>
            </div>

            <div className="mb-3 d-flex flex-column">
                {/* --- Input + Search Preview container --- */}
                <div className="position-relative mb-2">
                    <div className="d-flex">
                        <Form.Control
                            type="text"
                            placeholder="Add new contact..."
                            value={addContactInput}
                            onChange={(e) => {
                                setAddContactInput(e.target.value);
                                setShowPreview(true);
                            }}
                            className="me-2"
                            autoComplete="off"
                        />
                        <Button variant="primary" onClick={onAddContact}>
                            <Plus size={20} />
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
                                        action
                                        onClick={() => {
                                            setAddContactInput(contact.username);
                                            setShowPreview(false);
                                        }}
                                        className="d-flex align-items-center"
                                        style={{
                                            cursor: 'pointer',
                                            background: 'white',
                                        }}
                                    >
                                        <Avatar avatar={contact.avatar} size={24} />
                                        <span className="ms-2">{contact.username}</span>
                                    </ListGroup.Item>
                                ))
                            ) : searchLoading ? (
                                <ListGroup.Item disabled>Searching...</ListGroup.Item>
                            ) : externalSearchResult ? (
                                <ListGroup.Item
                                    action
                                    onClick={() => {
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
                    {contacts.map((contact) => {
                        const isOnline = onlineUsers.includes(contact.username);
                        const isSelected = selectedContact?.username === contact.username;

                        return (
                            <ListGroup.Item
                                as="div"
                                key={contact.username}
                                action
                                active={isSelected}
                                onClick={() => onSelectContact(contact)}
                                className="d-flex justify-content-between align-items-center cursor-pointer"
                            >
                                <div className="d-flex align-items-center">
                                    <Avatar avatar={contact.avatar} size={32} />
                                    <div className="ms-2">
                                        <div>{contact.username}</div>
                                        <small
                                            className={
                                                isOnline
                                                    ? 'text-success'
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
        </div>
    );
};

export default ContactsList;