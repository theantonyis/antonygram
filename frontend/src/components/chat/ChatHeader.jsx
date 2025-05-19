import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Avatar from '../common/Avatar';

const ChatHeader = ({ contact }) => {
    if (!contact) return null;

    return (
        <Row className="align-items-center border-bottom pb-2 mb-2">
            <Col xs="auto" className="ms-3 mt-2"> {/* Added ms-3 for left margin */}
                <Avatar avatar={contact.avatar} size={40} />
            </Col>
            <Col>
                <h5 className="mb-0 mt-1">{contact.username}</h5>
                <small className="text-muted">
                    {contact.isOnline ? 'Online' : `Last seen ${new Date(contact.lastSeen).toLocaleString()}`}
                </small>
            </Col>
        </Row>
    );
};

export default ChatHeader;