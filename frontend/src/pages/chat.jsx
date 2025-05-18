import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { Container, Button, Form, ListGroup, Row, Col } from 'react-bootstrap';
import Head from 'next/head';
import { Trash2, LogOut, Send } from 'lucide-react';
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

    const router = useRouter();
    const messagesEndRef = useRef(null);

    // Initialize socket connection once
    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const newSocket = io('http://localhost:5000', { auth: { token } });
        setSocket(newSocket);

        return () => {
            newSocket.disconnect(); // clean-up
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
            setUser({ username });
            socket?.emit('join', username);
        } catch {
            setUser({ username: 'Guest' });
        }
    }, [router, socket]);

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
        fetchContacts();
    }, []);

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
            await api.post('/messages', message);
            socket.emit('message', message);

            setInput('');
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };

    const handleClear = async () => {
        if (!selectedContact) return;

        try {
            await api.delete(`/messages/${selectedContact}`);
            setChatHistory(prev => ({ ...prev, [selectedContact]: [] }));
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear chat', err);
            alert('Failed to clear chat');
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
            setSearch('');
        } catch (error) {
            console.error('Failed to add contact:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Failed to add contact');
        }
    };

    const selectContact = (contact) => {
        setSelectedContact(contact);
        setMessages(chatHistory[contact] || []);
    };

    return (
        <>
            <Head>
                <title>Chat | antonygram</title>
            </Head>

            <Container fluid className="p-4" style={{ minHeight: '100vh' }}>
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
                                        action
                                        active={contact.username === selectedContact}
                                        onClick={() => selectContact(contact.username)}
                                    >
                                        <img
                                            src={contact.avatar || DEFAULT_AVATAR}
                                            alt={`${contact.username} avatar`}
                                            style={{ width: 32, height: 32, borderRadius: '50%', marginRight: 8 }}
                                        />
                                        {contact.username}
                                    </ListGroup.Item>
                                ))}
                        </ListGroup>

                        <Button variant="outline-warning" onClick={handleLogout} className="mt-4 w-100">
                            <LogOut size={16} /> Logout
                        </Button>
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
              <span
                  className={`px-3 py-2 rounded ${
                      msg.from === user.username ? 'bg-primary text-white' : 'bg-light text-dark'
                  }`}
              >
                {msg.text}
              </span>
                                            </ListGroup.Item>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </ListGroup>

                                <Form onSubmit={handleSend}>
                                    <Row>
                                        <Col xs={9}>
                                            <Form.Control
                                                type="text"
                                                placeholder="Type a message..."
                                                value={input}
                                                onChange={(e) => setInput(e.target.value)}
                                            />
                                        </Col>
                                        <Col xs={3}>
                                            <Button type="submit" variant="primary" className="w-100" disabled={!input.trim()}>
                                                Send <Send size={16} />
                                            </Button>
                                        </Col>
                                    </Row>
                                    <div className="mt-2 text-end">
                                        <Button variant="outline-danger" size="sm" onClick={handleClear}>
                                            <Trash2 size={16} /> Clear Chat
                                        </Button>
                                    </div>
                                </Form>
                            </>
                        ) : (
                            <div className="text-center text-muted mt-5">
                                <h5>Select a contact to start chatting</h5>
                            </div>
                        )}
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Chat;
