import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

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
        try {
            const response = await axios.post('/api/auth/login', { username, password }, { withCredentials: true });
            const { token } = response.data;
            document.cookie = `token=${token}; path=/; max-age=3600`;
            router.push('/chat');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>Login | antonygram</title>
            </Head>

            <div className="login-page fixed inset-0 bg-gray-100/50 flex justify-center items-center">
                <Container className="login-container w-50 max-w-md bg-white p-6 rounded-lg shadow-lg relative z-10">
                    <header className="login-header text-center mb-4">
                        <h1 className="text-3xl font-bold text-green-600">antonygram</h1>
                    </header>

                    {errorMessage && (
                        <Alert variant="danger" className="mb-3">
                            {errorMessage}
                        </Alert>
                    )}

                    <Form className="login-form mt-4" onSubmit={handleLogin}>
                        <h2 className="text-xl font-semibold mb-3 text-center">Login Page</h2>

                        <Form.Group controlId="username" className="mb-3">
                            <Form.Label className="text-gray-700">Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="bg-gray-100 rounded-md p-2 text-lg outline-none border-0"
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
                                className="bg-gray-100 rounded-md p-2 text-lg outline-none border-0"
                            />
                        </Form.Group>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700"
                        >
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="mr-2" />
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </Button>

                        <div className="text-center mt-3">
                            <span className="text-muted">Don't have an account? </span>
                            <Link href="/register" className="text-blue-500 hover:underline cursor-pointer">
                                Register a new account
                            </Link>
                        </div>
                    </Form>
                </Container>
            </div>

            {/* Background overlay */}
            <style jsx>{`
        .login-page::before {
          content: "";
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: -1;
        }
      `}</style>
        </>
    );
};

export default Login;
