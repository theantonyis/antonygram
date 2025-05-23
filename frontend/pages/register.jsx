import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/router';
import api from '@utils/axios.js';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import Head from "next/head";

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showRepeat, setShowRepeat] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Remove all spaces (spaces, tabs, etc.) from input before sending
        const usernameNoSpaces = username.replace(/\s/g, '');
        const passwordNoSpaces = password.replace(/\s/g, '');
        const passwordRepeatNoSpaces = passwordRepeat.replace(/\s/g, '');

        // Optionally ensure user knows passwords must match after removing spaces
        if (passwordNoSpaces !== passwordRepeatNoSpaces) {
            setErrorMessage('Passwords do not match!');
            return;
        }

        try {
            const response = await api.post(
                '/auth/register',
                { username: usernameNoSpaces, password: passwordNoSpaces },
                { withCredentials: true }
            );

            if (response.status === 200 || response.status === 201) {
                setSuccessMessage('Registration successful! Redirecting to login...');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setErrorMessage('Registration failed.');
            }
        } catch (error) {
            setErrorMessage(error.response?.data?.message || 'Something went wrong.');
        }
    };

    return (
        <>
            <Head>
                <title>register | antonygram</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <div className="register-page min-h-screen flex items-center justify-center bg-gray-100/50">
                <Container className="register-container bg-white p-4 p-sm-6 rounded-lg shadow-lg w-100" style={{maxWidth: 400}}>
                    <Row>
                        <Col className="register-header text-center mb-3">
                            <h1 className="text-3xl font-bold text-green-600">antonygram</h1>
                        </Col>
                    </Row>

                    {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                    {successMessage && <Alert variant="success">{successMessage}</Alert>}

                    <Form onSubmit={handleSubmit} className="register-form mt-3">
                        <h2 className="text-xl font-semibold mb-4 text-center">Register</h2>

                        {/* Username with icon */}
                        <Form.Group controlId="username" className="mb-4">
                            <Form.Label className="text-gray-700">Username</Form.Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <User size={18} />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="pl-10 pr-4 py-2 text-lg rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    style={{ paddingLeft: '2.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                                />
                            </div>
                        </Form.Group>

                        {/* Password with icon and toggle */}
                        <Form.Group controlId="password" className="mb-4">
                            <Form.Label className="text-gray-700">Password</Form.Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Lock size={18} />
                                </span>
                                <Form.Control
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10 pr-10 py-2 text-lg rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    style={{ paddingLeft: '2.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
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

                        {/* Repeat password with icon and toggle */}
                        <Form.Group controlId="passwordRepeat" className="mb-5">
                            <Form.Label className="text-gray-700">Repeat Password</Form.Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                    <Lock size={18} />
                                </span>
                                <Form.Control
                                    type={showRepeat ? 'text' : 'password'}
                                    placeholder="Repeat password"
                                    value={passwordRepeat}
                                    onChange={(e) => setPasswordRepeat(e.target.value)}
                                    required
                                    className="pl-10 pr-10 py-2 text-lg rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200"
                                    style={{ paddingLeft: '2.5rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                    onClick={() => setShowRepeat((prev) => !prev)}
                                    tabIndex={-1}
                                >
                                    {showRepeat ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </Form.Group>

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 text-white font-bold py-3 text-lg rounded-md hover:bg-blue-700"
                        >
                            Register
                        </Button>
                    </Form>

                    <div className="mt-4 text-center">
                        <p>
                            Already have an account?{' '}
                            <a href="/login" className="text-blue-600 hover:underline">
                                Login here
                            </a>
                        </p>
                    </div>
                </Container>

                {/* Background Overlay */}
                <style jsx global>{`
                    .register-page::before {
                        content: '';
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.5);
                        z-index: -1;
                    }
                `}</style>
            </div>
        </>
    );
};

export default Register;
