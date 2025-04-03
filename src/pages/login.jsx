import React, {useEffect, useState} from 'react';
import {Button, Container, Form, Row, Col, Alert, Spinner} from 'react-bootstrap';
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        // Example logic for sending login credentials to the server
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log('Login successful');
                // Set the JWT token in cookies
                document.cookie = `token=${data.token}; path=/; max-age=3600`;  // 1 hour expiration
                console.log('Token set in cookie:', document.cookie); // Check if the token is present

                await router.push('/chat');
            } else {
                setErrorMessage(data.message || 'Login failed');
            }
        } catch (error) {
            setErrorMessage('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>login | antonygram</title>
            </Head>
            <div className="login-page d-flex justify-content-center align-items-center vh-100 bg-light">
                <Container className="login-container">
                    <Row className="justify-content-center">
                        <Col xs={12} md={6}>
                            <header className="login-header text-center mb-4">
                                <h1 className="text-3xl font-bold">antonygram</h1>
                            </header>

                            {errorMessage && (
                                <Alert variant="danger" className="mb-3">
                                    {errorMessage}
                                </Alert>
                            )}

                            <Form id="login-form" className="login-form" onSubmit={handleLogin}>
                                <h2 className="text-xl font-semibold mb-3 text-center">Login Page</h2>

                                <Form.Group controlId="login" className="mb-3">
                                    <Form.Label className="text-gray-700">Login</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your login"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
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

                                <Button type="submit" variant="primary" className="w-100" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="mr-2"
                                            />
                                            Logging in...
                                        </>
                                    ) : (
                                        'Submit'
                                    )}
                                </Button>

                                <div className="text-center mt-3">
                                    <span className="text-muted" style={{ color: '#6c757d' }}>Don&#39;t have an account? </span>
                                    <Link href="/register" id="reg-new" className="text-primary hover:underline">
                                        Register a new account
                                    </Link>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default Login;
