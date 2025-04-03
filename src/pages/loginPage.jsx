import React, {useState} from 'react';
import { Button, Container, Form, Row, Col } from 'react-bootstrap';

const LoginPage = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Perform login logic here
        console.log('Login:', login);
        console.log('Password:', password);
    };

    return (
        <div className="login-page d-flex justify-content-center align-items-center vh-100 bg-light">
            <Container className="login-container">
                <Row className="justify-content-center">
                    <Col xs={12} md={6}>
                        <header className="login-header text-center mb-4">
                            <h1 className="text-3xl font-bold">antonygram</h1>
                        </header>
                        <Form id="login-form" className="login-form">
                            <h2 className="text-xl font-semibold mb-3 text-center">Login Page</h2>

                            <Form.Group controlId="login" className="mb-3">
                                <Form.Label className="text-gray-700">Login</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your login"
                                    value={login}
                                    onChange={(e) => setLogin(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="password" className="mb-3">
                                <Form.Label className="text-gray-700">Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Button type="submit" variant="primary" className="w-100">
                                Submit
                            </Button>

                            <div className="text-center mt-3">
                                <a href="/register" id="reg-new" className="text-blue-500 hover:underline">
                                    Register a new account
                                </a>
                            </div>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LoginPage;
