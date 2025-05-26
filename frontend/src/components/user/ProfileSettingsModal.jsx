// src/components/user/ProfileSettingsModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Form, Row, Col, Image, Spinner } from 'react-bootstrap';
import { X, Upload } from 'lucide-react';
import api from '@utils/axios';
import { handleUserProfileUpdate } from "@utils/chatHandlers.js";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ProfileSettingsModal = ({ show, onHide, user, onUserUpdate }) => {
    const [avatar, setAvatar] = useState(null);
    const [username, setUsername] = useState(user?.username || '');
    const [originalUsername] = useState(user?.username || '');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.avatar || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setPreviewUrl(user.avatar || '');
        }
    }, [user]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('File is too large (max 5MB)');
            return;
        }

        if (!selectedFile.type.startsWith('image/')) {
            setError('Only image files are allowed');
            return;
        }

        setFile(selectedFile);
        setError('');

        // Create preview URL
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(reader.result);
        reader.readAsDataURL(selectedFile);
    };

    const handleRemoveImage = () => {
        setFile(null);
        setPreviewUrl(user?.avatar || '');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        handleUserProfileUpdate({
            username,
            originalUsername,
            file,
            user,
            fileInputRef,
            setLoading,
            setError,
            onHide,
            onUserUpdate
        });
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <div className="text-center mb-4">
                        <div className="position-relative d-inline-block">
                            <Image
                                src={previewUrl || '/def-avatar.png'}
                                alt="User Avatar"
                                roundedCircle
                                width={100}
                                height={100}
                                className="border"
                            />
                            <div
                                className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2"
                                style={{ cursor: 'pointer' }}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <Upload size={16} color="white" />
                            </div>
                            {previewUrl && previewUrl !== user?.avatar && (
                                <Button
                                    variant="light"
                                    size="sm"
                                    className="position-absolute top-0 end-0 rounded-circle p-1"
                                    onClick={handleRemoveImage}
                                >
                                    <X size={16} />
                                </Button>
                            )}
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            accept="image/*"
                        />
                    </div>

                    <Form.Group className="mb-3">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            minLength={3}
                            required
                        />
                    </Form.Group>

                    {error && (
                        <div className="alert alert-danger py-2">{error}</div>
                    )}

                    <div className="d-flex justify-content-end mt-4">
                        <Button
                            variant="secondary"
                            className="me-2"
                            onClick={onHide}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={loading || (!file && username === originalUsername)}
                        >
                            {loading ? <Spinner animation="border" size="sm" /> : 'Save Changes'}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default ProfileSettingsModal;
