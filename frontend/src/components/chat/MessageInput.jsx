// components/Chat/MessageInput.jsx
import React, { useState, useRef } from 'react';
import { Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { Send, Paperclip, X, Image } from 'lucide-react';
import api from '@utils/axios.js';
import { toast } from "react-toastify";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MessageInput = ({ onSend, replyTo, onCancelReply }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState('');
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if ((!text.trim() && !file) || uploading) return;

        let fileData = null;

        if (file) {
            setUploading(true);
            setUploadError('');

            try {
                const formData = new FormData();
                formData.append('file', file);

                const response = await api.post(`${backendURL}/api/files/upload`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (response.data && response.data.file) {
                    fileData = {
                        blobName: response.data.file.blobName,
                        name: file.name,
                        type: file.type,
                        size: file.size
                    };
                }
            } catch (error) {
                console.error('Upload error:', error);
                setUploadError('Failed to upload file');
                toast.error('File upload failed. Please try again.');
                setUploading(false);
                return;
            }

            setUploading(false);
        }

        onSend(text, fileData);
        setText('');
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        if (selectedFile.size > MAX_FILE_SIZE) {
            setUploadError('File too large (max 5MB)');
            toast.error('File is too large. Maximum size is 5MB.');
            return;
        }

        setFile(selectedFile);
        setUploadError('');
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            {replyTo && (
                <div className="reply-container mb-2 p-2 rounded"
                     style={{
                         backgroundColor: '#f0f5ff',
                         borderLeft: '3px solid #3571b9',
                         position: 'relative',
                         display: 'flex',
                         gap: '8px'
                     }}
                >
                    <div className="flex-grow-1">
                        <div className="small fw-bold text-primary">
                            Replying to {replyTo.from}
                        </div>
                        <div className="text-muted small text-truncate" style={{ maxWidth: '85%' }}>
                            {replyTo.deleted ? 'Message was deleted' :
                                replyTo.text || (replyTo.file ? `[${replyTo.file.type.startsWith('image/') ? 'Image' : 'File'}]` : '')}
                        </div>
                    </div>
                    <Button
                        variant="link"
                        className="p-0 text-muted"
                        style={{ position: 'absolute', top: '2px', right: '2px' }}
                        onClick={onCancelReply}
                    >
                        <X size={16} />
                    </Button>
                </div>
            )}
            <Form onSubmit={handleSubmit}>
                {file && (
                    <div className="mb-2 p-2 border rounded d-flex align-items-center justify-content-between bg-light">
                        <div className="text-truncate">
                            <small className="d-block text-muted">Attached file:</small>
                            {file.name} ({Math.round(file.size / 1024)} KB)
                        </div>
                        <Button
                            variant="link"
                            className="text-danger p-0 ms-2"
                            onClick={removeFile}
                        >
                            <X size={18} />
                        </Button>
                    </div>
                )}
                {uploadError && (
                    <div className="mb-2 text-danger small">
                        {uploadError}
                    </div>
                )}
                <InputGroup>
                    <Button
                        variant="outline-secondary"
                        onClick={() => fileInputRef.current.click()}
                        disabled={uploading}
                    >
                        <Paperclip size={18} />
                    </Button>
                    <Form.Control
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={uploading}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={(!text.trim() && !file) || uploading}
                    >
                        {uploading ? <Spinner animation="border" size="sm" /> : <Send size={18} />}
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                </InputGroup>
            </Form>
        </>
    );
};

export default MessageInput;
