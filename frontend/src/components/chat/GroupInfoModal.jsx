import React, { useState } from 'react';
import { Modal, Button, ListGroup, Form, InputGroup, Badge } from 'react-bootstrap';
import { Users, UserPlus, Trash2, LogOut, UserMinus } from 'lucide-react';
import Avatar from '../common/Avatar';
import { handleAddGroupMember, handleRemoveGroupMember } from '@utils/chatHandlers';

const GroupInfoModal = ({
                            show,
                            onHide,
                            group,
                            setGroup,
                            currentUser,
                            onDeleteGroup,
                            refreshGroups
                        }) => {
    const [newMemberUsername, setNewMemberUsername] = useState('');

    // Fix isCreator check - using userId from currentUser
    const isCreator = currentUser && group?.creator &&
        (String(group.creator._id || group.creator) === String(currentUser.userId));

    console.log("Current user ID:", currentUser?.userId);
    console.log("Group creator ID:", group?.creator?._id || group?.creator);
    console.log("Is creator check result:", isCreator);

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!newMemberUsername.trim()) return;

        await handleAddGroupMember({
            groupId: group._id,
            username: newMemberUsername.trim(),
            setGroup
        });
        setNewMemberUsername('');
        refreshGroups();
    };

    const handleRemoveMember = async (username) => {
        await handleRemoveGroupMember({
            groupId: group._id,
            username,
            setGroup
        });
        refreshGroups();
    };

    const handleLeaveGroup = async () => {
        await handleRemoveGroupMember({
            groupId: group._id,
            username: currentUser.username,
            setGroup
        });
        onHide();
        refreshGroups();
    };

    if (!group) return null;

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                    <Avatar
                        avatar={group.avatar}
                        size={40}
                        fallbackIcon={<Users size={24} />}
                    />
                    <Modal.Title>{group.name}</Modal.Title>
                </div>
            </Modal.Header>
            <Modal.Body>
                {/* Add Member Form */}
                <Form onSubmit={handleAddMember} className="mb-4">
                    <Form.Group>
                        <Form.Label>Add Member</Form.Label>
                        <InputGroup>
                            <Form.Control
                                placeholder="Enter username"
                                value={newMemberUsername}
                                onChange={(e) => setNewMemberUsername(e.target.value)}
                            />
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={!newMemberUsername.trim()}
                            >
                                <UserPlus size={18} />
                            </Button>
                        </InputGroup>
                    </Form.Group>
                </Form>

                {/* Members List */}
                <h6 className="mb-3">Members ({group.members?.length || 0})</h6>
                <ListGroup variant="flush" className="mb-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {group.members?.map((member) => (
                        <ListGroup.Item
                            key={member._id || member}
                            className="d-flex justify-content-between align-items-center"
                            style={{ padding: '8px 0' }}
                        >
                            <div className="d-flex align-items-center" style={{ gap: '12px' }}>
                                <Avatar avatar={member.avatar} size={36} />
                                <div>
                                    <span>{member.username}</span>
                                    {group.creator &&
                                        (String(member._id) === String(group.creator._id || group.creator)) && (
                                            <Badge
                                                bg="primary"
                                                pill
                                                style={{ marginLeft: '8px', fontSize: '0.7em' }}
                                            >
                                                Creator
                                            </Badge>
                                        )}
                                </div>
                            </div>

                            {/* Show delete button if current user is creator and member is not creator */}
                            {isCreator &&
                                String(member._id) !== String(group.creator._id || group.creator) && (
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => handleRemoveMember(member.username)}
                                    >
                                        <UserMinus size={16} />
                                    </Button>
                                )}
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                {/* Action Buttons */}
                <div className="d-flex flex-column" style={{ gap: '10px' }}>
                    {!isCreator && (
                        <Button
                            variant="outline-danger"
                            className="d-flex align-items-center justify-content-center"
                            style={{ gap: '8px' }}
                            onClick={handleLeaveGroup}
                        >
                            <LogOut size={18} />
                            Leave Group
                        </Button>
                    )}

                    {isCreator && (
                        <Button
                            variant="danger"
                            className="d-flex align-items-center justify-content-center"
                            style={{ gap: '8px' }}
                            onClick={() => onDeleteGroup(group)}
                        >
                            <Trash2 size={18} />
                            Delete Group
                        </Button>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default GroupInfoModal;
