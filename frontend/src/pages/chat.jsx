import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { Container, Button, Form, ListGroup, Row, Col, Dropdown, Image, Modal } from 'react-bootstrap';
import Head from 'next/head';
import { Trash2, LogOut, Send, MoreVertical, UserRoundX } from 'lucide-react';
import { getToken } from '@/utils/getToken';
import api from '@/utils/axios';

const DEFAULT_AVATAR = '/def-avatar.png';

const Chat = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [input, setInput] = useState('');
    const [contactsList, setContactsList] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [chatHistory, setChatHistory] = useState({}); // { contactUsername: [...messages] }
    const [search, setSearch] = useState('');
    const [onlineUsers, setOnlineUsers] = useState([]);

    const router = useRouter();
    const messagesEndRef = useRef(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);

    const openDeleteModal = (contact) => {
        setContactToDelete(contact);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setContactToDelete(null);
        setShowDeleteModal(false);
    };

    const confirmDeleteContact = () => {
        if (contactToDelete) {
            handleDeleteContact(contactToDelete);
            closeDeleteModal();
        }
    };


    // Initialize socket connection once
    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const newSocket = io('http://localhost:5000', { auth: { token } });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, []);

    // Set user from token cookie and join socket room
    useEffect(() => {
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!tokenCookie) {
            router.push('/login');
            return;
        }

        const token = tokenCookie.split('=')[1];
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const username = payload.username || 'Guest';
            const avatar = payload.avatar || DEFAULT_AVATAR;
            setUser({ username, avatar });
        } catch {
            setUser({ username: 'Guest', avatar: DEFAULT_AVATAR });
        }
    }, [router]);

    useEffect(() => {
        if (socket && user?.username) {
            socket.emit('join', user.username);

            socket.on('onlineUsers', (usernames) => {
                setOnlineUsers(usernames);
            });

            socket.on('userConnected', (username) => {
                setOnlineUsers(prev => [...new Set([...prev, username])]);
            });

            socket.on('userDisconnected', (username) => {
                setOnlineUsers(prev => prev.filter(u => u !== username));
            });

            return () => {
                socket.off('onlineUsers');
                socket.off('userConnected');
                socket.off('userDisconnected');
            };

        }
    }, [socket, user]);


    // Scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Fetch messages for selected contact or load from cache
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
    }, [selectedContact, chatHistory]);

    // Handle incoming socket messages
    useEffect(() => {
        if (!socket || !user) return;

        const messageHandler = ({ from, to, text }) => {
            const contact = from === user.username ? to : from;

            setChatHistory(prev => ({
                ...prev,
                [contact]: [...(prev[contact] || []), { from, to, text }],
            }));

            if (contact === selectedContact) {
                setMessages(prev => [...prev, { from, to, text }]);
            }
        };

        socket.on('message', messageHandler);

        return () => socket.off('message', messageHandler);
    }, [socket, user, selectedContact]);

    // Fetch contacts list on mount
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await api.get('/contacts');
                setContactsList(res.data.contacts);
            } catch (error) {
                console.error('Failed to fetch contacts', error);
            }
        };
        setContactsList(prev =>
            prev.map(c => ({
                ...c,
                online: onlineUsers.includes(c.username),
            }))
        );
        fetchContacts();
    }, [onlineUsers]);

    const handleLogout = useCallback(() => {
        document.cookie = 'token=; Max-Age=0; path=/';
        router.push('/login');
    }, [router]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedContact) return;

        const message = {
            from: user.username,
            to: selectedContact,
            text: input.trim(),
        };

        try {
            // Only emit via socket; the backend should handle saving to DB
            socket.emit('message', message);

            setInput('');
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const handleClear = async (contact) => {
        if (!contact) return;

        try {
            await api.delete(`/messages/${contact}`);
            setChatHistory(prev => ({ ...prev, [contact]: [] }));
            if (contact === selectedContact) setMessages([]);
        } catch (err) {
            console.error('Failed to clear chat', err);
            alert('Failed to clear chat');
        }
    };

    const handleDeleteContact = async (contact) => {
        if (!contact) return;

        try {
            await api.delete(`/contacts/${contact}`);
            setContactsList(prev => prev.filter(c => c.username !== contact));

            // Clear chatHistory & messages if deleted contact is selected
            setChatHistory(prev => {
                const newHistory = { ...prev };
                delete newHistory[contact];
                return newHistory;
            });

            if (contact === selectedContact) {
                setSelectedContact(null);
                setMessages([]);
            }
        } catch (error) {
            console.error('Failed to delete contact', error);
            alert('Failed to delete contact');
        }
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;

        try {
            const res = await api.post(
                '/contacts/add',
                { username: search.trim() }
            );
            setContactsList(res.data.contacts);
            setSelectedContact(search.trim()); // Automatically select new contact
            setSearch('');
        } catch (error) {
            console.error('Failed to add contact:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Failed to add contact');
        }
    };

    const selectContact = (contact) => {
        setSelectedContact(contact);
        setMessages(chatHistory[contact] || []);

        if (socket && user?.username) {
            socket.emit('joinRoom', { withUser: contact });
        }
    };

    return (
        <>
            <Head>
                <title>Chat | antonygram</title>
            </Head>

            <Container fluid className="p-4" style={{ minHeight: '100vh' }}>
                <Row className="mb-4 align-items-center">
                    <Col xs="auto" className="d-flex align-items-center">
                        <Image
                            src={user?.avatar || DEFAULT_AVATAR}
                            alt="User Avatar"
                            roundedCircle
                            width={48}
                            height={48}
                            className="me-2"
                        />
                        <strong>{user?.username}</strong>
                    </Col>
                    <Col className="text-end">
                        <Button variant="outline-warning" onClick={handleLogout}>
                            <LogOut size={16} /> Logout
                        </Button>
                    </Col>
                </Row>

                <Row>
                    <Col md={3} className="border-end">
                        <h4 className="mb-3">Contacts</h4>
                        <Form onSubmit={handleAddContact} className="mb-3">
                            <Form.Control
                                type="text"
                                placeholder="Search or add user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button type="submit" variant="success" className="mt-2 w-100">
                                Add Contact
                            </Button>
                        </Form>

                        <ListGroup>
                            {contactsList
                                .filter((c) => c.username !== user?.username)
                                .map((contact) => (
                                    <ListGroup.Item
                                        key={contact.username}
                                        className={`d-flex justify-content-between cursor-pointer align-items-center ${contact.username === selectedContact ? 'active' : ''}`}
                                        onClick={() => selectContact(contact.username)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center' }}>
                                            <img
                                                src={contact.avatar || DEFAULT_AVATAR}
                                                alt={`${contact.username} avatar`}
                                                style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }}
                                            />
                                            <div>
                                                <div>{contact.username}</div>
                                                <small className={contact.username === selectedContact ? 'text-white' : 'text-muted'}>
                                                    {contact.online ? (
                                                        <span className="text-success">● Online</span>
                                                    ) : (
                                                        <span>Last seen: {new Date(contact.lastSeen).toLocaleString()}</span>
                                                    )}
                                                </small>
                                            </div>
                                        </div>

                                        <Dropdown
                                            onClick={e => e.stopPropagation()} // Stop dropdown click from selecting contact
                                            align="end"
                                        >
                                            <Dropdown.Toggle
                                                variant={contact.username === selectedContact ? "primary" : "light"}
                                                size="sm"
                                                id={`dropdown-${contact.username}`}
                                                className={`no-caret ${contact.username === selectedContact ? "active-toggle" : ""} p-0 
                                                bg-transparent hover:bg-gray-200 transition-colors duration-200 rounded`}
                                            >
                                                <MoreVertical
                                                    size={18}
                                                    className={contact.username === selectedContact ? 'text-white' : 'text-gray-600'}
                                                />
                                            </Dropdown.Toggle>


                                            <Dropdown.Menu
                                                className={`rounded shadow-lg border-none p-1`}
                                            >
                                                <Dropdown.Item onClick={() => handleClear(contact.username)}>
                                                <div className="d-flex align-items-center">
                                                        <Trash2 size={16} className="me-2" />
                                                        <span>Clear Chat</span>
                                                    </div>
                                                </Dropdown.Item>

                                                <Dropdown.Item
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        openDeleteModal(contact.username);
                                                    }}
                                                    className="text-danger d-flex align-items-center"
                                                >
                                                <div className="d-flex align-items-center">
                                                        <UserRoundX size={16} className="me-2" />
                                                        <span>Delete Contact</span>
                                                    </div>
                                                </Dropdown.Item>
                                            </Dropdown.Menu>
                                        </Dropdown>
                                    </ListGroup.Item>
                                ))}
                        </ListGroup>
                    </Col>

                    <Col md={9}>
                        {selectedContact ? (
                            <>
                                <h4 className="mb-3">Chat with {selectedContact}</h4>

                                <ListGroup className="mb-3 overflow-auto" style={{ maxHeight: '65vh' }}>
                                    {messages.length === 0 ? (
                                        <ListGroup.Item className="text-muted text-center">No messages yet</ListGroup.Item>
                                    ) : (
                                        messages.map((msg, i) => (
                                            <ListGroup.Item
                                                key={i}
                                                className={`d-flex justify-content-${msg.from === user.username ? 'end' : 'start'}`}
                                            >
                                                <div
                                                    style={{
                                                        backgroundColor: msg.from === user.username ? '#cfe9ff' : '#eee',
                                                        borderRadius: 12,
                                                        padding: '8px 12px',
                                                        maxWidth: '70%',
                                                    }}
                                                >
                                                    {msg.text}
                                                </div>
                                            </ListGroup.Item>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </ListGroup>

                                <Form onSubmit={handleSend} className="d-flex">
                                    <Form.Control
                                        placeholder="Type a message..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        autoComplete="off"
                                    />
                                    <Button type="submit" variant="primary" className="ms-2">
                                        <Send size={20} />
                                    </Button>
                                </Form>
                            </>
                        ) : (
                            <div className="text-center text-muted mt-5">Select a contact to start chatting</div>
                        )}
                    </Col>
                </Row>
            </Container>

            <Modal show={showDeleteModal} onHide={closeDeleteModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Delete Contact</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete contact <strong>{contactToDelete}</strong>? This will also clear the chat history.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeDeleteModal}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteContact}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default Chat;