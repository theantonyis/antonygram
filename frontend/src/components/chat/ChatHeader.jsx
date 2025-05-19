// components/Chat/ChatHeader.js
import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Avatar from '../common/Avatar';

const ChatHeader = ({ contact, onLogout }) => {
    if (!contact) return null;

    return (
        <Row className="align-items-center border-bottom pb-2 mb-2">
            <Col xs="auto">
                <Avatar avatar={contact.avatar} size={40} />
            </Col>
            <Col>
                <h5 className="mb-0">{contact.username}</h5>
                <small className="text-muted">
                    {contact.isOnline ? 'Online' : `Last seen ${new Date(contact.lastSeen).toLocaleString()}`}
                </small>
            </Col>
        </Row>
    );
};

export default ChatHeader;
