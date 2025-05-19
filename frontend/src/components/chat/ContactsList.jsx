import React, { useState } from 'react';
import { ListGroup, Form, Button, Dropdown } from 'react-bootstrap';
import { UserMinus, Plus, MoreVertical, Trash2 } from 'lucide-react';
import Avatar from '../common/Avatar';
import dayjs from 'dayjs';

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
    // Track which dropdown is open (null means none are open)
    const [openDropdown, setOpenDropdown] = useState(null);

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4>Welcome, {user?.username || 'Guest'}!</h4>
            </div>

            <div className="mb-3 d-flex">
                <Form.Control
                    type="text"
                    placeholder="Add new contact..."
                    value={addContactInput}
                    onChange={(e) => setAddContactInput(e.target.value)}
                    className="me-2"
                />
                <Button variant="primary" onClick={onAddContact}>
                    <Plus size={20} />
                </Button>
            </div>

            <ListGroup>
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
                                show={openDropdown === contact.username} // Control open state here
                                onToggle={(isOpen, e, meta) => {
                                    // meta.source === 'select' is used by react-bootstrap for toggling
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
                                            setOpenDropdown(null); // Close dropdown
                                        }}
                                    >
                                        <Trash2 size={16} className="me-2" style={{ color: 'red' }} />
                                        Clear Chat
                                    </Dropdown.Item>
                                    <Dropdown.Item
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteContact(contact);
                                            setOpenDropdown(null); // Close dropdown
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
    );
};

export default ContactsList;