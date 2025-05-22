import React, { useRef, useEffect } from 'react';
import Avatar from '../common/Avatar';

const AVATAR_SIZE = 36;

const MessageList = ({ messages, currentUser }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!Array.isArray(messages)) return <div>not an array</div>;
    if (messages.length === 0) return (
      <div className="text-muted text-center py-5">No messages yet</div>
    );

    // Add h-100 and overflow-auto so it fills space and scrolls!
    return (
        <div
            className="flex-grow-1 d-flex flex-column h-100 overflow-auto px-2 py-3"
            style={{ background: 'none', minHeight: 0 }}
        >
            {messages.map((msg, index) => {
                const isOwn = msg.from === currentUser.username;
                const avatar = msg.senderAvatar || (isOwn ? currentUser.avatar : null);
                return (
                    <div
                        key={`${msg.from}_${msg.timestamp}_${msg.text}_${index}`}
                        className={`d-flex align-items-end mb-2 ${isOwn ? 'justify-content-end' : 'justify-content-start'}`}
                        style={{ gap: '10px' }}
                    >
                        {!isOwn && <Avatar avatar={avatar} size={AVATAR_SIZE} />}
                        <div
                            style={{
                                maxWidth: '90%',
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
                                boxShadow: '0 1px 6px rgba(90,110,140,0.06)'
                            }}
                        >
                            <div className="fw-semibold small mb-1"
                                 style={{
                                     color: '#3571b9',
                                     opacity: 0.8,
                                     fontWeight: 500,
                                     textAlign: isOwn ? "right" : "left"
                                 }}>
                                {msg.from}
                            </div>
                            <div className="mb-1">{msg.text}</div>
                            <div className="text-end" style={{ fontSize: '0.83em' }}>
                                <span className="text-secondary" style={{ opacity: 0.67 }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        hour12: false
                                    })}
                                </span>
                            </div>
                        </div>
                        {isOwn && <Avatar avatar={avatar} size={AVATAR_SIZE} />}
                    </div>
                );
            })}
            <div ref={endRef} />
        </div>
    );
};

export default MessageList;
