import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import Link from 'next/link';

const Register = () => {
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password !== passwordRepeat) {
            alert('Passwords do not match!');
            return;
        }
        console.log('Login:', login);
        console.log('Password:', password);
        console.log('Password Repeat:', passwordRepeat);
    };

    return (
        <Container className="register-page bg-light d-flex justify-content-center align-items-center vh-100">
            <Row className="w-100 max-w-md bg-white p-5 rounded-lg shadow-lg">
                <Col className="text-center">
                    <h1 className="text-3xl font-bold">antonygram</h1>
                </Col>
                <Form id="register-form" className="w-100" onSubmit={handleSubmit}>
                    <h2 className="text-xl font-semibold mb-3 text-center">Register Page</h2>

                    <Form.Group className="mb-3" controlId="login">
                        <Form.Label>Login</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter your login"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="passwordRepeat">
                        <Form.Label>Repeat Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Repeat your password"
                            value={passwordRepeat}
                            onChange={(e) => setPasswordRepeat(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="w-100">
                        Submit
                    </Button>

                    {/* "Already have an account?" Link */}
                    <div className="mt-3 text-center">
                        <p>Already have an account? <Link href="/login" className="text-primary">Login here</Link></p>
                    </div>
                </Form>
            </Row>
        </Container>
    );
};

export default Register;
