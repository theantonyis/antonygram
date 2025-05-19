// components/Chat/MessageList.js
import React, { useRef, useEffect } from 'react';
import { ListGroup } from 'react-bootstrap';
import Avatar from '../common/Avatar';

const MessageList = ({ messages, currentUser }) => {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <ListGroup className="flex-grow-1 overflow-auto" style={{ maxHeight: '60vh' }}>
            {messages.map((msg, index) => {
                const isOwn = msg.sender === currentUser.username;
                return (
                    <ListGroup.Item
                        key={index}
                        className={`d-flex ${isOwn ? 'justify-content-end text-end' : 'justify-content-start text-start'}`}
                    >
                        {!isOwn && <Avatar avatar={msg.senderAvatar} size={24} />}
                        <div className="ms-2 me-2">
                            <div className={`fw-bold ${isOwn ? 'text-primary' : 'text-dark'}`}>{msg.sender}</div>
                            <div>{msg.text}</div>
                            <small className="text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</small>
                        </div>
                        {isOwn && <Avatar avatar={msg.senderAvatar} size={24} />}
                    </ListGroup.Item>
                );
            })}
            <div ref={endRef} />
        </ListGroup>
    );
};

export default MessageList;
