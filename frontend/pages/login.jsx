import React, { useState } from 'react';
import { Container, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import api from '@utils/axios.js';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setLoading(true);

        // Remove all spaces from input before sending
        const usernameWithoutSpaces = username.replace(/\s/g, '');
        const passwordWithoutSpaces = password.replace(/\s/g, '');

        try {
            const response = await api.post('/auth/login', { username: usernameWithoutSpaces, password: passwordWithoutSpaces }, { withCredentials: true });
            const { token } = response.data;
            document.cookie = `token=${token}; path=/; max-age=3600`;
            await router.push('/chat');
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Head>
                <title>login | antonygram</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="login-page min-h-screen flex items-center justify-center bg-gray-100/50">
                <Container className="login-container bg-white p-4 p-sm-6 rounded-lg shadow-lg w-100" style={{maxWidth: 400}}>
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
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <User size={18} />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="pl-10 pr-10 py-2 text-lg rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    style={{ paddingLeft: '2.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                                />
                            </div>
                        </Form.Group>


                        <Form.Group controlId="password" className="mb-3">
                            <Form.Label className="text-gray-700">Password</Form.Label>
                            <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                              <Lock size={18} />
                            </span>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10 pr-10 py-2 text-lg rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
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
