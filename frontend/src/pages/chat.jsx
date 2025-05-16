import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { Container, Button, Form, ListGroup, Row, Col } from 'react-bootstrap';
import Head from "next/head";
import { Trash2, LogOut, Send } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [input, setInput] = useState('');
    const router = useRouter();
    const messagesEndRef = useRef(null);

    // Scroll to bottom on messages update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Check token and extract user info on mount
    useEffect(() => {
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!tokenCookie) {
            router.push('/login');
            return;
        }
        const token = tokenCookie.split('=')[1];

        // Example: decode token to get username (replace with your real logic)
        try {
            // Simple base64 decode to simulate user info in token (example only)
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ username: payload.username || 'Guest' });
        } catch {
            // Fallback if decoding fails
            setUser({ username: 'Guest' });
        }
    }, [router]);

    const handleClear = () => setMessages([]);
    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/';
        router.push('/login');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages((prev) => [...prev, input.trim()]);
            setInput('');
        }
    };

    return (
        <>
            <Head>
                <title>chat | antonygram</title>
            </Head>

            <Container
                className="my-8 p-6 rounded-lg shadow-lg bg-white max-w-3xl mx-auto"
                style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column' }}
            >
                <header className="text-center mb-5">
                    <h1 className="text-4xl font-extrabold text-indigo-600 mb-3 select-none">antonygram</h1>
                    <div className="flex justify-center gap-4 mb-4">
                        <Button
                            variant="outline-danger"
                            onClick={handleClear}
                            className="flex items-center gap-2 transition hover:bg-red-100"
                        >
                            <Trash2 size={18} /> Clear chat
                        </Button>
                        <Button
                            variant="outline-warning"
                            onClick={handleLogout}
                            className="flex items-center gap-2 transition hover:bg-yellow-100"
                        >
                            <LogOut size={18} /> Logout
                        </Button>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-700 select-text">
                        {user?.username || 'Loading...'}
                    </h2>
                </header>

                <ListGroup
                    className="flex-grow-1 mb-4 overflow-y-auto rounded border border-gray-200 shadow-inner"
                    style={{ maxHeight: 'calc(80vh - 220px)', scrollbarWidth: 'thin' }}
                >
                    {messages.length === 0 && (
                        <ListGroup.Item className="text-gray-500 italic text-center">
                            No messages yet. Start the conversation!
                        </ListGroup.Item>
                    )}

                    {messages.map((msg, i) => (
                        <ListGroup.Item
                            key={i}
                            className="text-gray-800 bg-indigo-50 rounded-md mb-2 shadow-sm border-0"
                        >
                            {msg}
                        </ListGroup.Item>
                    ))}

                    <div ref={messagesEndRef} />
                </ListGroup>

                <Form onSubmit={handleSubmit} className="mt-auto">
                    <Row>
                        <Col xs={9}>
                            <Form.Control
                                type="text"
                                placeholder="Enter message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="border-indigo-500 focus:ring-indigo-400 focus:outline-none focus:ring-2 rounded transition"
                            />
                        </Col>
                        <Col xs={3}>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!input.trim()}
                                className="w-full flex items-center justify-center gap-2 transition hover:bg-indigo-700"
                            >
                                Send <Send size={16} />
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </>
    );
};

export default Chat;
