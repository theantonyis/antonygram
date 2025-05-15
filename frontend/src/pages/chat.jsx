import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Button, Form, ListGroup, Row, Col } from 'react-bootstrap';
import Head from "next/head";
import { Trash2, LogOut, Send } from 'lucide-react';

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('John Doe');
    const [input, setInput] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!token) {
            router.push('/login');
        }
    }, []);

    const handleClear = () => {
        setMessages([]);
    };

    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0; path=/';
        router.push('/login');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages([...messages, input.trim()]);
            setInput('');
        }
    };

    return (
        <>
            <Head>
                <title>chat | antonygram</title>
            </Head>
            <Container className="my-5 p-5 rounded-lg shadow-lg bg-white max-w-3xl mx-auto">
                <header className="text-center mb-4">
                    <h1 className="text-4xl font-bold mb-3 text-indigo-600">antonygram</h1>

                    <div className="flex justify-center gap-4 mb-4">
                        <Button variant="outline-danger" onClick={handleClear} className="flex items-center gap-2">
                            <Trash2 size={18} /> Clear chat
                        </Button>
                        <Button variant="outline-warning" onClick={handleLogout} className="flex items-center gap-2">
                            <LogOut size={18} /> Logout
                        </Button>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-700">{user}</h2>
                </header>

                <ListGroup className="mb-3 max-h-96 overflow-y-auto">
                    {messages.map((msg, i) => (
                        <ListGroup.Item key={i} className="text-gray-800">
                            {msg}
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <Form onSubmit={handleSubmit}>
                    <Row>
                        <Col xs={9}>
                            <Form.Control
                                type="text"
                                placeholder="Enter message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="border-indigo-500 focus:ring-indigo-400"
                            />
                        </Col>
                        <Col xs={3}>
                            <Button type="submit" variant="primary" className="w-full flex items-center justify-center gap-2">
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