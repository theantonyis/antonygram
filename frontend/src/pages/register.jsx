import React, { useState } from 'react';
import { Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { useRouter } from 'next/router';
import axios from 'axios';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (password !== passwordRepeat) {
            setErrorMessage('Passwords do not match!');
            return;
        }

        try {
            const response = await axios.post(
                '/api/auth/register',
                { username, password },
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
        <div className="register-page fixed inset-0 bg-gray-100/50 flex justify-center items-center">
            <Container className="register-container w-50 max-w-md bg-white p-6 rounded-lg shadow-lg relative z-10">
                <Row>
                    <Col className="register-header text-center mb-4">
                        <h1 className="text-3xl font-bold text-green-600">antonygram</h1>
                    </Col>
                </Row>

                {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}

                <Form onSubmit={handleSubmit} className="register-form mt-4">
                    <h2 className="text-xl font-semibold mb-4 text-center">Register</h2>

                    <Form.Group controlId="username" className="mb-4">
                        <Form.Label className="text-gray-700">Login</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 text-lg"
                        />
                    </Form.Group>

                    <Form.Group controlId="password" className="mb-4">
                        <Form.Label className="text-gray-700">Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 text-lg"
                        />
                    </Form.Group>

                    <Form.Group controlId="passwordRepeat" className="mb-5">
                        <Form.Label className="text-gray-700">Repeat Password</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Repeat password"
                            value={passwordRepeat}
                            onChange={(e) => setPasswordRepeat(e.target.value)}
                            required
                            className="rounded-md border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 p-2 text-lg"
                        />
                    </Form.Group>

                    <Button
                        type="submit"
                        className="w-full bg-blue-600 text-white font-bold py-6 text-lg rounded-md hover:bg-blue-700"
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
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: -1;
        }
      `}</style>
        </div>
    );
};

export default Register;
