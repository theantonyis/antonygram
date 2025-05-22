import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Avatar from '../common/Avatar';
import dayjs from 'dayjs';

const ChatHeader = ({ contact }) => {
    if (!contact) return null;

    return (
        <Row className="align-items-center border-bottom pb-2 mb-2">
            <Col xs="auto">
                <Avatar avatar={contact.avatar} size={40} />
            </Col>
            <Col>
                <h5 className="mb-0">{contact.username}</h5>
                <small
                    className={contact.isOnline ? 'online-status' : 'text-muted'}
                >
                    {contact.isOnline
                        ? 'Online'
                        : `Last seen ${dayjs(contact.lastSeen).format('DD/MM/YYYY HH:mm')}`}
                </small>
            </Col>
        </Row>
    );
};

export default ChatHeader;
