// components/Chat/ContactsList.js
import React from 'react';
import { ListGroup, Form, Button, Dropdown } from 'react-bootstrap';
import { PersonCircle, Plus, ThreeDotsVertical } from 'react-bootstrap-icons';
import Avatar from '../common/Avatar';

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
                    <Plus />
                </Button>
            </div>

            <ListGroup>
                {contacts.map((contact) => {
                    const isOnline = onlineUsers.includes(contact.username);
                    const isSelected = selectedContact?.username === contact.username;

                    return (
                        <ListGroup.Item
                            key={contact.username}
                            action
                            active={isSelected}
                            onClick={() => onSelectContact(contact)}
                            className="d-flex justify-content-between align-items-center"
                        >
                            <div className="d-flex align-items-center">
                                <Avatar avatar={contact.avatar} size={32} />
                                <div className="ms-2">
                                    <div>{contact.username}</div>
                                    <small className={isOnline ? 'text-success' : 'text-muted'}>
                                        {isOnline ? 'Online' : `Last seen ${new Date(contact.lastSeen).toLocaleString()}`}
                                    </small>
                                </div>
                            </div>
                            <Dropdown align="end">
                                <Dropdown.Toggle variant="link" bsPrefix="p-0 border-0" id="dropdown-basic">
                                    <ThreeDotsVertical />
                                </Dropdown.Toggle>

                                <Dropdown.Menu>
                                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); onClearChat(contact); }}>
                                        Clear Chat
                                    </Dropdown.Item>
                                    <Dropdown.Item onClick={(e) => { e.stopPropagation(); onDeleteContact(contact); }}>
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
