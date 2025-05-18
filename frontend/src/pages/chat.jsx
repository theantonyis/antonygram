import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { Container, Button, Form, ListGroup, Row, Col } from 'react-bootstrap';
import Head from 'next/head';
import { Trash2, LogOut, Send } from 'lucide-react';
import axios from "axios";

const socket = io('http://localhost:5000'); // Backend WebSocket URL

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [input, setInput] = useState('');
    const [contactsList, setContactsList] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [chatHistory, setChatHistory] = useState({}); // { contactUsername: [...messages] }

    const router = useRouter();
    const messagesEndRef = useRef(null);

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
            socket.emit('join', username);
        } catch {
            setUser({ username: 'Guest' });
        }
    }, []);

    // Scroll to latest message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        socket.on('message', ({ from, to, text }) => {
            const contact = from === user?.username ? to : from;

            setChatHistory(prev => ({
                ...prev,
                [contact]: [...(prev[contact] || []), { from, to, text }],
            }));

            if (contact === selectedContact) {
                setMessages(prev => [...prev, { from, to, text }]);
            }
        });

        return () => {
            socket.off('message');
        };
    }, [user, selectedContact]);

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await axios.get('/api/contacts', {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                    },
                });
                setContactsList(res.data.contacts);
            } catch (error) {
                console.error('Failed to fetch contacts', error);
            }
        };

        fetchContacts();
    }, []);

    const getToken = () => {
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        return tokenCookie ? tokenCookie.split('=')[1] : '';
    };

    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/';
        router.push('/login');
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedContact) return;

        const message = {
            from: user.username,
            to: selectedContact,
            text: input.trim(),
        };

        socket.emit('message', message);

        setChatHistory(prev => ({
            ...prev,
            [selectedContact]: [...(prev[selectedContact] || []), message],
        }));

        setMessages(prev => [...prev, message]);
        setInput('');
    };

    const handleClear = () => {
        if (selectedContact) {
            setChatHistory(prev => ({ ...prev, [selectedContact]: [] }));
            setMessages([]);
        }
    };

    const selectContact = async (contact) => {
        setSelectedContact(contact);

        try {
            const res = await axios.get(`/api/messages/${contact}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                },
            });

            setChatHistory(prev => ({ ...prev, [contact]: res.data.messages }));
            setMessages(res.data.messages);
        } catch (error) {
            console.error('Failed to fetch messages', error);
            setMessages([]);
        }
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
                        <ListGroup>
                            {contactsList.filter(c => c !== user?.username).map((contact, idx) => (
                                <ListGroup.Item
                                    key={idx}
                                    action
                                    active={contact === selectedContact}
                                    onClick={() => selectContact(contact)}
                                >
                                    {contact}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        <Button
                            variant="outline-warning"
                            onClick={handleLogout}
                            className="mt-4 w-100"
                        >
                            <LogOut size={16} /> Logout
                        </Button>
                    </Col>

                    <Col md={9}>
                        <h4 className="mb-3">Chat with {selectedContact || '...'}</h4>

                        <ListGroup
                            className="mb-3 overflow-auto"
                            style={{ maxHeight: '65vh' }}
                        >
                            {messages.length === 0 && (
                                <ListGroup.Item className="text-muted text-center">
                                    No messages yet
                                </ListGroup.Item>
                            )}

                            {messages.map((msg, i) => (
                                <ListGroup.Item
                                    key={i}
                                    className={`d-flex justify-content-${msg.from === user.username ? 'end' : 'start'}`}
                                >
                                    <span
                                        className={`px-3 py-2 rounded ${msg.from === user.username ? 'bg-primary text-white' : 'bg-light text-dark'}`}
                                    >
                                        {msg.text}
                                    </span>
                                </ListGroup.Item>
                            ))}
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
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-100"
                                        disabled={!input.trim() || !selectedContact}
                                    >
                                        Send <Send size={16} />
                                    </Button>
                                </Col>
                            </Row>
                            <div className="mt-2 text-end">
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={handleClear}
                                    disabled={!selectedContact}
                                >
                                    <Trash2 size={16} /> Clear Chat
                                </Button>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Chat;
