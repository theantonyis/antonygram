import React, { useRef, useEffect, useState } from 'react';
import Avatar from '../common/Avatar';
import { Trash2, CornerDownLeft, MoreVertical } from 'lucide-react';
import { decrypt } from '@utils/aes256.js';
import dayjs from 'dayjs';

const AVATAR_SIZE = 36;

const MessageList = ({ messages, currentUser, onDeleteMessage, onReplyMessage }) => {
    const endRef = useRef(null);
    const [openMenuIdx, setOpenMenuIdx] = useState(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

                // Decrypt reply text if present
                const replyText = msg.replyTo && msg.replyTo.text ? decrypt(msg.replyTo.text) : '';

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
                                <span className="text-muted">Message deleted</span>
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
                                        {/* Always show a name, but don't show "Unknown" if message is deleted */}
                                        {!msg.replyTo.deleted && msg.replyTo.from}
                                    </span>
                                    <span style={{
                                        color: '#5e5e5e',
                                        fontWeight: 400,
                                        fontSize: '0.93em',
                                    }}>
                                        {/* Only show "message deleted" for deleted replies */}
                                        {msg.replyTo.deleted
                                            ? <span className="text-muted" style={{ fontStyle: 'italic' }}>Message deleted</span>
                                            : (replyText
                                                ? (replyText.length > 60
                                                    ? replyText.slice(0, 60) + '…'
                                                    : replyText)
                                                : '')
                                        }
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
                                {msg._text ||
                                (msg.text ?
                                (typeof msg.text === 'string' && msg.text.includes('==') ?
                                decrypt(msg.text) : msg.text)
                                : '')}
                            </div>
                            <div className="text-end" style={{ fontSize: '0.83em' }}>
                                <span className="text-secondary" style={{ opacity: 0.67 }}>
                                    {dayjs(msg.timestamp).format('HH:mm')}
                                </span>
                            </div>
                            {/* inside MessageList component, inside the return (replace ONLY the bubble actions and remove the MoreVertical/menu logic): */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 10,
                                    zIndex: 3,
                                }}
                                tabIndex={-1}
                                onBlur={() => setOpenMenuIdx(null)}
                            >
                                <MoreVertical
                                    size={19}
                                    style={{ cursor: 'pointer', opacity: 0.8 }}
                                    onClick={() => setOpenMenuIdx(openMenuIdx === index ? null : index)}
                                    title="More"
                                />
                                {openMenuIdx === index && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 26,
                                            right: 0,
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
