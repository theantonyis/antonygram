// components/Chat/MessageList.js
import React, { useRef, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import Avatar from '../common/Avatar';

const MessageList = ({ messages, currentUser }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

console.log("messages", messages);
if (!Array.isArray(messages)) return <div>not an array</div>;
if (messages.length === 0) return <div>no messages</div>;

    return (
        <ListGroup className="flex-grow-1 overflow-auto" style={{ maxHeight: '60vh' }}>
            {messages.map((msg, index) => {
                // Use `from` and fallback for avatar
                const isOwn = msg.from === currentUser.username;
                const avatar = msg.senderAvatar || (isOwn ? currentUser.avatar : null);

                return (
                    <ListGroup.Item
                        key={index}
                        className={`d-flex ${isOwn ? 'justify-content-end text-end' : 'justify-content-start text-start'}`}
                    >
                        {!isOwn && <Avatar avatar={avatar} size={24} />}
                        <div className="ms-2 me-2">
                            <div className={`fw-bold ${isOwn ? 'text-primary' : 'text-dark'}`}>{msg.from}</div>
                            <div>{msg.text}</div>
                            <small className="text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</small>
                        </div>
                        {isOwn && <Avatar avatar={avatar} size={24} />}
                    </ListGroup.Item>
                );
            })}
            <div ref={endRef} />
        </ListGroup>
    );
};

export default MessageList;