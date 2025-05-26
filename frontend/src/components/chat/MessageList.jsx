import React, { useRef, useEffect, useState } from 'react';
import Avatar from '../common/Avatar';
import { Trash2, CornerDownLeft, MoreVertical, Download } from 'lucide-react';
import { decrypt } from '@utils/aes256.js';
import dayjs from 'dayjs';
import { Button } from 'react-bootstrap';
import api from '@utils/axios';

const AVATAR_SIZE = 36;

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const MessageList = ({ messages, currentUser, onDeleteMessage, onReplyMessage }) => {
    const endRef = useRef(null);
    const [openMenuIdx, setOpenMenuIdx] = useState(null);
    const [downloading, setDownloading] = useState({});
    const [fileUrls, setFileUrls] = useState({});

    console.log('Rendering messages:', messages);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const loadImageUrls = async () => {
            for (const message of messages) {
                if (message.file?.blobName &&
                    message.file.type &&
                    message.file.type.startsWith('image/')) {

                    try {
                        console.log('Checking message for file:', message);
                        const response = await api.get(`${backendURL}/api/files/view/${message.file.blobName}`);
                        setFileUrls(prev => ({
                            ...prev,
                            [message.file.blobName]: response.data.url
                        }));
                    } catch (error) {
                        console.error('Failed to get image URL:', error);
                    }
                }
            }
        };

        loadImageUrls();

        // Auto-refresh URLs every 14 minutes (just before the 15-minute expiry)
        const interval = setInterval(loadImageUrls, 14 * 60 * 1000);
        return () => clearInterval(interval);
    }, [messages]);

    const handleDownload = async (file) => {
        if (!file || !file.blobName) return;

        console.log('Downloading file:', file);

        try {
            setDownloading(prev => ({ ...prev, [file.blobName]: true }));

            // Always request a fresh URL for downloads to avoid expired URLs
            const response = await api.get(`${backendURL}/api/files/download/${file.blobName}`);
            const url = response.data.url;

            // Open in new tab for images (can be saved from there)
            if (file.type && file.type.startsWith('image/')) {
                window.open(url, '_blank');
            } else {
                // For non-images, use download attribute
                const a = document.createElement('a');
                a.href = url;
                a.download = file.name || 'download';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file. Please try again.');
        } finally {
            setDownloading(prev => ({ ...prev, [file.blobName]: false }));
        }
    };

    const renderFileAttachment = (file) => {
        if (!file) return null;

        const isImage = file.type && file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const imageUrl = fileUrls[file.blobName];
        const fallbackSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZjBmMCIgLz48dGV4dCB4PSI1MCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';

        return (
            <div className="message-file-attachment mt-2">
                {isImage && (
                    <div className="message-image-preview mb-2" style={{ position: 'relative', display: 'inline-block' }}>
                        <img
                            src={imageUrl || fallbackSvg}
                            alt={file.name || "Image attachment"}
                            className="img-fluid rounded"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '200px',
                                objectFit: 'contain',
                                cursor: 'pointer',
                                backgroundColor: '#f8f9fa'
                            }}
                            onClick={() => handleDownload(file)}
                            onError={async (e) => {
                                e.target.onerror = null;
                                e.target.src = fallbackSvg;
                                if (file.blobName) {
                                    try {
                                        const response = await api.get(`${backendURL}/api/files/view/${file.blobName}`);
                                        const newUrl = response.data.url;
                                        setFileUrls(prev => ({
                                            ...prev,
                                            [file.blobName]: newUrl
                                        }));
                                        setTimeout(() => {
                                            if (e.target) e.target.src = newUrl;
                                        }, 100);
                                    } catch (err) {
                                        console.error('Failed to refresh image URL:', err);
                                    }
                                }
                            }}
                        />
                        <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-1"
                            style={{ position: 'absolute', right: 0, bottom: 0 }}
                            disabled={downloading[file.blobName]}
                            onClick={() => handleDownload(file)}
                        >
                            {downloading[file.blobName] ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <Download size={16} />
                            )}
                        </Button>
                    </div>
                )}

                {isPdf && (
                    <div className="message-pdf-preview mb-2 p-2 border rounded" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="d-flex align-items-center">
                            {/* ...existing PDF icon and info... */}
                            <Button
                                variant="outline-primary"
                                size="sm"
                                className="ms-2"
                                disabled={downloading[file.blobName]}
                                onClick={() => handleDownload(file)}
                            >
                                {downloading[file.blobName] ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    <Download size={16} />
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {!isImage && !isPdf && (
                    <div className="d-flex align-items-center">
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            disabled={downloading[file.blobName]}
                            onClick={() => handleDownload(file)}
                            style={{ fontSize: '0.8rem' }}
                        >
                            <Download size={14} className="me-1" />
                            {file.name || "Attachment"}
                            {downloading[file.blobName] && <span className="spinner-border spinner-border-sm ms-1" role="status" aria-hidden="true"></span>}
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    if (!Array.isArray(messages)) return <div>not an array</div>;
    if (messages.length === 0) return (
        <div className="text-muted text-center py-5">No messages yet</div>
    );

    return (
        <div
            className="flex-grow-1 d-flex flex-column h-100 overflow-auto px-2 py-3 message-list-wrapper"
            style={{ background: 'none', minHeight: 0 }}
        >
            {messages.map((msg, index) => {
                if (msg.deleted) return null;

                const isOwn = msg.from === currentUser.username;
                const avatar = msg.senderAvatar || (isOwn ? currentUser.avatar : null);

                // If the message itself is deleted
                if (msg.deleted) {
                    return (
                        <div
                            key={`${msg.from}_${msg.timestamp}_${msg._id || msg.text}_${index}`}
                            className={`d-flex align-items-end mb-2 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
                            style={{ gap: '10px', position: 'relative' }}
                        >
                            {!isOwn && <Avatar avatar={avatar} size={AVATAR_SIZE} className="chat-message-avatar" />}
                            <div
                                className="chat-message-bubble position-relative"
                                style={{
                                    maxWidth: '98%',
                                    display: 'inline-block',
                                    background: '#f8fafc',
                                    color: '#737373',
                                    borderRadius: isOwn
                                        ? '20px 20px 8px 20px'
                                        : '20px 20px 20px 8px',
                                    padding: '14px 20px',
                                    fontSize: '1.07em',
                                    wordBreak: 'break-word',
                                    fontStyle: 'italic',
                                    opacity: 0.8,
                                    boxShadow: '0 1px 6px rgba(90,110,140,0.06)',
                                    position: 'relative',
                                    textAlign: isOwn ? "right" : "left"
                                }}
                            >
                                <span className="text-muted">Message deleted
                                    {msg.file && renderFileAttachment(msg.file)}
                                </span>
                            </div>
                            {isOwn && <Avatar avatar={avatar} size={AVATAR_SIZE} className="chat-message-avatar" />}
                        </div>
                    );
                }

                return (
                    <div
                        key={`${msg.from}_${msg.timestamp}_${msg.text}_${index}`}
                        className={`d-flex align-items-end mb-2 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
                        style={{ gap: '10px', position: 'relative' }}
                    >
                        {!isOwn && <Avatar avatar={avatar} size={AVATAR_SIZE} className="chat-message-avatar" />}
                        <div
                            className="chat-message-bubble position-relative"
                            style={{
                                maxWidth: '98%', // or try maxWidth: 640 if you prefer a pixel max
                                display: 'inline-block',
                                background: isOwn ? '#d0e6ff' : '#fff',
                                color: '#232323',
                                borderRadius: isOwn
                                    ? '20px 20px 8px 20px'
                                    : '20px 20px 20px 8px',
                                padding: '14px 20px',
                                fontSize: '1.07em',
                                wordBreak: 'break-word',
                                transition: 'background 0.18s',
                                boxShadow: '0 1px 6px rgba(90,110,140,0.06)',
                                position: 'relative',
                                overflow: 'visible'
                            }}
                        >
                            {msg.replyTo && typeof msg.replyTo === 'object' && (msg.replyTo.from || msg.replyTo.text || msg.replyTo.deleted !== undefined) && (
                                <div
                                    className="mb-2 small"
                                    style={{
                                        borderLeft: '3px solid #1976d2',
                                        background: isOwn ? '#c9e3fb' : '#f0f4f8',
                                        margin: '0 0 6px 0',
                                        padding: '6px 10px',
                                        borderRadius: 5,
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        alignItems: 'center',
                                        gap: 6,
                                        fontStyle: 'italic',
                                        maxWidth: '100%',
                                    }}
                                >
                                    {msg.replyTo.senderAvatar && (
                                        <Avatar avatar={msg.replyTo.senderAvatar} size={22} />
                                    )}
                                    <span style={{
                                        fontWeight: 600,
                                        color: '#3173b6',
                                        marginRight: 3,
                                    }}>
                                        {msg.replyTo.from || 'Unknown'}
                                    </span>
                                    <span style={{
                                        color: '#5e5e5e',
                                        fontWeight: 400,
                                        fontSize: '0.93em',
                                    }}>
                                        {msg.replyTo.deleted ? 'Message was deleted' :
                                            (msg.replyTo.text && typeof msg.replyTo.text === 'string' ?
                                                (msg.replyTo.text.startsWith('U2FsdGVk') ?
                                                    decrypt(msg.replyTo.text) : msg.replyTo.text)
                                                : '')}
                                    </span>
                                </div>
                            )}

                            <div className="fw-semibold small mb-1"
                                 style={{
                                     color: '#3571b9',
                                     opacity: 0.8,
                                     fontWeight: 500,
                                     textAlign: isOwn ? "right" : "left"
                                 }}>
                                {msg.from}
                            </div>
                            <div className="mb-1">
                                {msg._text || // For temporary messages
                                    (msg.text && typeof msg.text === 'string' ?
                                        (msg.text.startsWith('U2FsdGVk') ?
                                            decrypt(msg.text) : msg.text)
                                        : '')}
                            </div>
                            {msg.file && !msg.deleted && renderFileAttachment(msg.file)}

                            <div className="text-end" style={{ fontSize: '0.83em' }}>
                                <span className="text-secondary" style={{ opacity: 0.67 }}>
                                    {dayjs(msg.timestamp).format('HH:mm')}
                                </span>
                            </div>
                            {/* inside MessageList component, inside the return (replace ONLY the bubble actions and remove the MoreVertical/menu logic): */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: '2px',
                                    right: isOwn ? '-30px' : 'auto',
                                    left: isOwn ? 'auto' : '-30px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    zIndex: 10
                                }}
                                tabIndex={-1}
                                onBlur={() => setOpenMenuIdx(null)}
                            >
                                <MoreVertical
                                    size={18}
                                    style={{
                                        cursor: 'pointer',
                                        color: '#7a7a7a',
                                        opacity: openMenuIdx === index ? 1 : 0.65
                                    }}
                                    onClick={() => setOpenMenuIdx(openMenuIdx === index ? null : index)}
                                    title="More"
                                />
                                {openMenuIdx === index && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 26,
                                            right: isOwn ? 0 : 'auto',  // Position dropdown based on message ownership
                                            left: isOwn ? 'auto' : 0,
                                            background: '#fff',
                                            boxShadow: '0 2px 12px rgba(60,80,110,.13)',
                                            borderRadius: 7,
                                            minWidth: 44,
                                            padding: '2px 0',
                                            zIndex: 333,
                                            border: '1px solid #e4e9f2',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'stretch',
                                        }}
                                    >
                                        <button
                                            style={{
                                                background: 'none',
                                                border: 'none',
                                                padding: '7px 10px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                fontSize: 15,
                                                color: '#3571b9',
                                                transition: 'background 0.13s',
                                            }}
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                                setOpenMenuIdx(null);
                                                onReplyMessage(msg);
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background='#f4f7fb'}
                                            onMouseLeave={e => e.currentTarget.style.background='none'}
                                            title="Reply"
                                        >
                                            <CornerDownLeft size={17} />
                                        </button>
                                        {isOwn && (
                                            <button
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    padding: '7px 10px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    fontSize: 15,
                                                    color: '#c43d2d',
                                                    transition: 'background 0.13s',
                                                }}
                                                onMouseDown={e => e.preventDefault()}
                                                onClick={() => {
                                                    setOpenMenuIdx(null);
                                                    onDeleteMessage(msg);
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background='#fae7e7'}
                                                onMouseLeave={e => e.currentTarget.style.background='none'}
                                                title="Delete"
                                            >
                                                <Trash2 size={17} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        {isOwn && <Avatar avatar={avatar} size={AVATAR_SIZE} className="chat-message-avatar" />}
                    </div>
                );
            })}
            <div ref={endRef} />
        </div>
    );
};

export default MessageList;
