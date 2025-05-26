// components/Chat/MessageInput.js
import React, { useState, useRef } from 'react';
import { Form, InputGroup, Button, Spinner } from 'react-bootstrap';
import { Send, Paperclip, X } from 'react-bootstrap-icons';
import api from '@utils/axios.js';
import {toast} from "react-toastify";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const MessageInput = ({ onSend, replyTo, onCancelReply }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if ((!text.trim() && !file) || uploading) return;
        try {
            let fileData = null;

            if (file) {
                setUploading(true);
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await api.post(`${backendURL}/api/files/upload`, formData, {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    fileData = response.data.file
                } catch (err) {
                    console.error('File upload failed:', err);
                    toast.error('File upload failed');
                    return;
                } finally {
                    setUploading(false);
                }
            }

            onSend(text, fileData);
            setText('');
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
            console.error('Failed to send message:', err);
            toast.error('Failed to send message');
        }
    };

    const handleFileChange = (e) => {
        const fileObj = e.target.files[0];
        if (fileObj) {
            if (fileObj.size > MAX_FILE_SIZE) {
                toast.error('File is too big (max 5MB)');
                if (fileInputRef.current) fileInputRef.current.value = '';
                return;
            }
            setFile(fileObj);
        }
    };

    const removeFile = () => {
        setFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };


    return (
        <Form onSubmit={handleSubmit}>
            {replyTo && (
              <div className="alert alert-info py-1 px-2 mb-2 d-flex justify-content-between align-items-center">
                <span>
                  Replying to <strong>{replyTo.from}</strong>: {replyTo.text.length > 36 ? replyTo.text.slice(0,36) + '…' : replyTo.text}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="ms-2 p-0"
                  style={{ textDecoration: "none", fontSize: '1.2em', lineHeight: '0.7' }}
                  onClick={onCancelReply}
                >&times;</Button>
              </div>
            )}

            {file && (
                <div className="d-flex align-items-center mb-2 p-2 bg-light rounded">
                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {file.name}
                    </div>
                    <Button
                        variant="link"
                        className="p-0 ms-2"
                        onClick={removeFile}
                    >
                        <X />
                    </Button>
                </div>
            )}

            <InputGroup>
                <Button
                    variant="outline-secondary"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                >
                    <Paperclip />
                </Button>
                <Form.Control
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message..."
                    disabled={uploading}
                />
                <Button type="submit" variant="primary" disabled={(!text.trim() && !file) || uploading}>
                    {uploading ? <Spinner animation="border" size="sm" /> : <Send />}
                </Button>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    accept="image/*, application/pdf, text/plain, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
            </InputGroup>
        </Form>
    );
};

export default MessageInput;
