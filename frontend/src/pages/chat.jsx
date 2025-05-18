import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import io from 'socket.io-client';
import { Container, Button, Form, ListGroup, Row, Col } from 'react-bootstrap';
import Head from 'next/head';
import { Trash2, LogOut, Send } from 'lucide-react';
import axios from "axios";
import { getToken } from '@/utils/getToken';


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
    const DEFAULT_AVATAR = '/def-avatar.png';

    useEffect(() => {
        const token = getToken();
        if (!token) return;

        const newSocket = io('http://localhost:5000', {
            auth: { token },
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

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
        if (!selectedContact) return;

        if (chatHistory[selectedContact]) {
            setMessages(chatHistory[selectedContact]);
        } else {
            const fetchMessages = async () => {
                try {
                    const res = await axios.get(`/api/messages/${selectedContact}`, {
                        headers: { Authorization: `Bearer ${getToken()}` },
                    });
                    setChatHistory(prev => ({ ...prev, [selectedContact]: res.data.messages }));
                    setMessages(res.data.messages);
                } catch (err) {
                    console.error('Failed to fetch messages', err);
                    setMessages([]);
                }
            };
            fetchMessages();
        }
    }, [selectedContact]);


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

    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/';
        router.push('/login');
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedContact) return;

        const message = {
            from: user.username,
            to: selectedContact,
            text: input.trim(),
        };

        try {
            // Save message to DB via REST API
            await axios.post('/api/messages', {
                content: message.text,
                userId: user.username, // or user id
                to: selectedContact
            }, {
                headers: { Authorization: `Bearer ${getToken()}` }
            });

            // Emit the message through socket
            socket.emit('message', message);

            // Update local state
            setChatHistory(prev => ({
                ...prev,
                [selectedContact]: [...(prev[selectedContact] || []), message],
            }));
            setMessages(prev => [...prev, message]);
            setInput('');
        } catch (err) {
            console.error('Failed to send message', err);
        }
    };


    const handleClear = () => {
        if (selectedContact) {
            setChatHistory(prev => ({ ...prev, [selectedContact]: [] }));
            setMessages([]);
        }
    };

    const handleAddContact = async (e) => {
        e.preventDefault();
        if (!search.trim()) return;

        try {
            const res = await axios.post('/api/contacts/add', { username: search.trim() }, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                }
            });

            setContactsList(res.data.contacts);
            setSearch('');
        } catch (error) {
            console.error('Failed to add contact:', error.response?.data || error.message);
            alert(error.response?.data?.error || 'Failed to add contact');
        }
    };

    const selectContact = (contact) => {
        setMessages([]);
        setSelectedContact(contact);
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
                        <Form className="mb-3" onSubmit={handleAddContact}>
                            <Form.Control
                                type="text"
                                placeholder="Search or add user..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button type="submit" className="mt-2 w-100" variant="success">
                                Add Contact
                            </Button>
                        </Form>

                        <ListGroup>
                            {contactsList.filter(c => c.username !== user?.username).map((contact) => (
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
