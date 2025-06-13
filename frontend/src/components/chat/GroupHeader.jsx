// frontend/src/components/chat/GroupHeader.jsx
import React from 'react';
import Avatar from '../common/Avatar';
import { Users, Trash2 } from 'lucide-react';
import { Row, Col, Button } from 'react-bootstrap';

const GroupHeader = ({ group, onShowInfoModal }) => {
    if (!group) return null;

    return (
        <div
            className="d-flex align-items-center justify-content-between cursor-pointer pb-2 border-bottom mb-2"
            onClick={onShowInfoModal}
        >
            <div className="d-flex align-items-center">
                <Avatar avatar={group.avatar} size={40} fallbackIcon={<Users size={32} />} />
                <div className="ms-2">
                    <h5 className="mb-0">{group.name}</h5>
                    <small className="text-muted">
                        {Array.isArray(group.members) ? group.members.length : 0} member
                        {(!Array.isArray(group.members) || group.members.length !== 1) ? 's' : ''}
                    </small>
                </div>
            </div>
        </div>
    );
};

export default GroupHeader;
