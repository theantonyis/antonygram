import React, { useState } from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { Users, UserMinus, Trash2, UserPlus } from 'lucide-react';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import UserSearchField from '../common/UserSearchField';
import Avatar from '../common/Avatar';
import DeleteGroupModal from './DeleteGroupModal';
import { handleAddGroupMember, handleRemoveGroupMember } from '@utils/chatHandlers';

const GroupInfoModal = ({
    show,
    onHide,
    group,
    setGroup,
    currentUser,
    refreshGroups,
    onGroupDeleted
}) => {
    const [newMember, setNewMember] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Check if current user is group creator
    const isCreator = group?.creator?._id === currentUser?.userId ||
        group?.creator?.username === currentUser?.username;

    const handleAddMember = (user) => {
        if (user && user.username) {
            // Add member using the imported handler
            handleAddGroupMember({
                groupId: group?._id,
                username: user.username,
                setGroup,
                refreshGroups
            });
            setNewMember('');
        }
    };

    const handleRemoveMember = (username) => {
        handleRemoveGroupMember({
            groupId: group?._id,
            username,
            setGroup,
            refreshGroups
        });

        if (username === currentUser?.username) {
            onHide();
            if (onGroupDeleted) onGroupDeleted(group._id);
        }
    };

    // Prepare the list of current member usernames to exclude from search
    const currentMemberUsernames = Array.isArray(group?.members)
        ? group.members.map(member => member.username)
        : [];

    return (
        <>
            <Modal show={show} onHide={onHide} centered size="lg">
                <Modal.Header closeButton>
                    <Modal.Title className="d-flex align-items-center">
                        <Avatar
                            avatar={group?.avatar}
                            size={38}
                            fallbackIcon={<Users size={28} />}
                            className="me-2"
                        />
                        <span className="ms-2">{group?.name || 'Group Info'}</span>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="mb-4">
                        <h5 className="mb-3">About</h5>
                        <div className="d-flex flex-column">
                            <div className="mb-2">
                                <span className="fw-semibold">Group Name: </span>
                                {group?.name}
                            </div>
                            <div className="mb-2">
                                <span className="fw-semibold">Created by: </span>
                                {group?.creator?.username || 'Unknown'}
                            </div>
                            <div className="mb-2">
                                <span className="fw-semibold">Created at: </span>
                                {dayjs(group.createdAt).format('DD/MM/YYYY HH:mm')}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <h5 className="d-flex justify-content-between align-items-center mb-3">
                            <span>Members ({Array.isArray(group?.members) ? group.members.length : 0})</span>
                        </h5>

                        {/* Add new member section */}
                        <div className="mb-3">
                            <UserSearchField
                                placeholder="Add a new member..."
                                value={newMember}
                                onChange={setNewMember}
                                onUserSelect={handleAddMember}
                                excludeUsernames={currentMemberUsernames}
                            />
                        </div>

                        {/* Members list */}
                        <ListGroup variant="flush">
                            {Array.isArray(group?.members) && group.members.map(member => (
                                <ListGroup.Item
                                    key={member._id || member.username}
                                    className="d-flex justify-content-between align-items-center"
                                >
                                    <div className="d-flex align-items-center">
                                        <Avatar avatar={member.avatar} size={32} />
                                        <div className="ms-2">
                                            {member.username}
                                            {member.username === currentUser?.username && (
                                                <Badge bg="secondary" className="ms-2">
                                                    You
                                                </Badge>
                                            )}
                                            {member.username === group?.creator?.username && (
                                                <Badge bg="primary" className="ms-2">
                                                    Creator
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Show remove button if current user is creator or is removing themselves */}
                                    {(isCreator || member.username === currentUser?.username) &&
                                        member.username !== group?.creator?.username && (
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveMember(member.username)}
                                                title={member.username === currentUser?.username ?
                                                    "Leave group" : "Remove member"}
                                            >
                                                <UserMinus size={16} />
                                                {member.username === currentUser?.username ? " Leave" : ""}
                                            </Button>
                                        )}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Modal.Body>

                <Modal.Footer className="justify-content-between">
                    {isCreator && (
                        <Button
                            variant="danger"
                            onClick={() => setShowDeleteModal(true)}
                            className="d-flex align-items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Delete Group
                        </Button>
                    )}

                    {!isCreator && (
                        <Button
                            variant="outline-danger"
                            onClick={() => handleRemoveMember(currentUser.username)}
                            className="d-flex align-items-center gap-2"
                        >
                            <UserMinus size={16} />
                            Leave Group
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Delete confirmation modal */}
            <DeleteGroupModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                group={group}
                setGroup={setGroup}
                onGroupDeleted={onGroupDeleted}
                setGroups={refreshGroups}
            />
        </>
    );
};

export default GroupInfoModal;
