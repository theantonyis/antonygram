import React, { useRef, useEffect, useState } from 'react';
import Avatar from '../common/Avatar';
import { Trash2, CornerDownLeft, MoreVertical, Download, FileText, Image as ImageIcon } from 'lucide-react';
import { decrypt } from '@utils/aes256.js';
import dayjs from 'dayjs';
import { Button } from 'react-bootstrap';
import ImageModal from './ImageModal';
import api from '@utils/axios';

const AVATAR_SIZE = 36;

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

const MessageList = ({ messages, currentUser, onDeleteMessage, onReplyMessage }) => {
    const endRef = useRef(null);
    const [openMenuIdx, setOpenMenuIdx] = useState(null);
    const [downloading, setDownloading] = useState({});
    const [fileUrls, setFileUrls] = useState({});
    const [imgError, setImgError] = useState(false);
    const [modalImage, setModalImage] = useState(null);


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

        try {
            setDownloading(prev => ({ ...prev, [file.blobName]: true }));

            // Always request a fresh URL for downloads/views
            const response = await api.get(`${backendURL}/api/files/download/${file.blobName}`);
            const url = response.data.url;

            if (file.type === 'application/pdf') {
                // Open PDF in a new tab
                window.open(url, '_blank', 'noopener,noreferrer');
            } else {
                // Download other files
                const res = await fetch(url);
                const blob = await res.blob();
                const a = document.createElement('a');
                a.href = window.URL.createObjectURL(blob);
                a.download = file.name || 'download';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(a.href);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file. Please try again.');
        } finally {
            setDownloading(prev => ({ ...prev, [file.blobName]: false }));
        }
    };

    const handleImageClick = async (e, file) => {
        e.stopPropagation(); // Prevent triggering other click events

        if (!file || !file.blobName) return;

        try {
            // Get a fresh URL for the image to avoid expired URLs
            const response = await api.get(`${backendURL}/api/files/view/${file.blobName}`);
            setModalImage({
                url: response.data.url,
                name: file.name || 'Image'
            });
        } catch (error) {
            console.error('Failed to load image for modal:', error);
        }
    };

    const renderFileAttachment = (file) => {
        if (!file) return null;

        const isImage = file.type && file.type.startsWith('image/');
        const isPdf = file.type === 'application/pdf';
        const imageUrl = fileUrls[file.blobName];
        const downloadingFile = downloading[file.blobName];

        const overlayIconStyle = {
            position: 'absolute',
            top: 6,
            right: 6,
            background: 'rgba(255,255,255,0.85)',
            borderRadius: '50%',
            padding: 3,
            zIndex: 2,
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        };

        if (isImage) {
            return (
                <div className="message-file-attachment mt-2">
                    <div className="message-image-preview mb-2" style={{ position: 'relative', display: 'inline-block' }}>
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={file.name || 'Image attachment'}
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    cursor: 'pointer',
                                    borderRadius: '8px'
                                }}
                                onClick={(e) => handleImageClick(e, file)}
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <div style={{
                                width: '200px',
                                height: '150px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '8px'
                            }}>
                                <ImageIcon size={48} color="#adb5bd" />
                            </div>
                        )}
                        <Button
                            variant="light"
                            size="sm"
                            style={overlayIconStyle}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(file);
                            }}
                            disabled={downloadingFile}
                        >
                            {downloadingFile ? (
                                <span className="spinner-border spinner-border-sm" />
                            ) : (
                                <Download size={20} color="#3571b9" />
                            )}
                        </Button>
                    </div>
                    {file.name && (
                        <div className="small text-muted mb-2" style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {file.name}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div style={{ position: 'relative', display: 'inline-block', minWidth: 120, minHeight: 60 }}>
                <div
                    style={{
                        width: 120,
                        height: 60,
                        background: '#f4f4f4',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#888',
                        fontSize: 18,
                        gap: 8,
                    }}
                >
                    {isPdf ? <FileText size={28} /> : <FileText size={24} />}
                    <span style={{ fontSize: 13, maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {file.name}
                    </span>
                </div>
                <Download
                    size={20}
                    style={overlayIconStyle}
                    onClick={() => handleDownload(file)}
                    title="Download"
                    color="#3571b9"
                />
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
                            {msg.replyTo && typeof msg.replyTo === 'object' && (msg.replyTo.from || msg.replyTo.text || msg.replyTo.file || msg.replyTo.deleted !== undefined) && (
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
                                        {msg.replyTo.deleted ? 'Message was deleted' : (
                                            <>
                                                {(msg.replyTo.text && typeof msg.replyTo.text === 'string' && msg.replyTo.text.length > 0) ?
                                                    (msg.replyTo.text.startsWith('U2FsdGVk') ? decrypt(msg.replyTo.text) : msg.replyTo.text) :
                                                    ''}
                                                {msg.replyTo.file && (
                                                    `${(msg.replyTo.text && typeof msg.replyTo.text === 'string' && msg.replyTo.text.length > 0) ? ' ' : ''}[${msg.replyTo.file?.type?.startsWith('image/') ? 'Image' : 'File'}]`
                                                )}
                                            </>
                                        )}
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
            <ImageModal modalImage={modalImage} setModalImage={setModalImage} />
        </div>
    );
};

export default MessageList;
