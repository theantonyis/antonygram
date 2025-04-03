// pages/chat.js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Button, Form, ListGroup, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Head from "next/head";

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('John Doe');
    const [input, setInput] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = document.cookie.split('; ').find(row => row.startsWith('token='));
        console.log('Token in cookie:', token);  // Log the token value
        if (!token) {
            router.push('/login');
        }
    }, []);

    const handleClear = () => {
        setMessages([]);
    };

    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0';  // Clear the token
        router.push('/login');  // Redirect to login page
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages([...messages, input]);
            setInput('');
        }
    };

    return (
        <>
            <Head>
                <title>chat | antonygram</title>
            </Head>
            <Container className="my-5">
                <header className="text-center mb-4">
                    <h1>antonygram</h1>
                    {/* Buttons for Clear chat and Logout */}
                    <div className="buttons mb-3">
                        <Button variant="danger" onClick={handleClear} className="me-3">
                            Clear chat
                        </Button>
                        <Button variant="warning" onClick={handleLogout}>
                            Logout
                        </Button>
                    </div>
                    <h2>{user}</h2>
                </header>
                <ListGroup className="mb-3">
                    {messages.map((msg, index) => (
                        <ListGroup.Item key={index}>{msg}</ListGroup.Item>
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
                            />
                        </Col>
                        <Col xs={3}>
                            <Button type="submit" variant="primary" className="w-100">Send</Button>
                        </Col>
                    </Row>
                </Form>
            </Container>
        </>
    );
};

export default Chat;
