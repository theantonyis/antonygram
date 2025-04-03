import React, { useState } from 'react';
import { Container, Button, Form, ListGroup, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState('John Doe');  // Replace with dynamic user logic
    const [input, setInput] = useState('');
    const [weather, setWeather] = useState({
        icon: 'http://openweathermap.org/img/wn/01d.png',
        city: 'Kyiv',
        temp: '25°C'
    });

    const handleClear = () => {
        setMessages([]);
    };

    const handleLogout = () => {
        document.cookie = 'token=; Max-Age=0';
        location.assign('/login');
        alert('Logged out');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim()) {
            setMessages([...messages, input]);
            setInput('');
        }
    };

    return (
        <Container className="my-5">
            <header className="text-center mb-4">
                <h1>Antonygram</h1>
                <div className="buttons mb-3">
                    <Button variant="link" onClick={handleClear}>Clear chat</Button>
                    <Button variant="link" onClick={handleLogout}>Logout</Button>
                </div>
                <h2>{user}</h2>
                <div id="weather" className="my-3">
                    <img id="icon" src={weather.icon} alt="Weather icon" />
                    <p id="city">{weather.city}</p>
                    <p id="temp">{weather.temp}</p>
                </div>
            </header>
            <ListGroup id="messages" className="mb-3">
                {messages.map((msg, index) => (
                    <ListGroup.Item key={index}>{msg}</ListGroup.Item>
                ))}
            </ListGroup>
            <Form id="form" onSubmit={handleSubmit}>
                <Row>
                    <Col xs={9}>
                        <Form.Control
                            type="text"
                            id="input"
                            placeholder="Enter message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                    </Col>
                    <Col xs={3}>
                        <Button type="submit" variant="primary" className="w-100">
                            Send
                        </Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
};

export default ChatPage;
