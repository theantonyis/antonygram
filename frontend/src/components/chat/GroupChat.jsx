import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import { Users, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Row, Col, Button, Form, Modal, ListGroup, Badge } from 'react-bootstrap';
import { handleAddGroupMember, handleDeleteGroup, handleRemoveGroupMember } from '@utils/chatHandlers';
import { decrypt } from "@utils/aes256.js";

const AVATAR_SIZE = 38;

const GroupChat = ({
                     group,
                     messages,
                     currentUser,
                     onSendMessage,
                     onDeleteMessage,
                     onReplyMessage,
                     replyTo,
                     onCancelReply,
                     setGroup,
                     onGroupDeleted,
                     refreshGroups,
                   }) => {
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newMember, setNewMember] = useState('');

  if (!group) {
    return <div className="text-center text-muted py-5">Select or create a group to start chatting.</div>;
  }

  const addMember = async (e) => {
    e.preventDefault();
      try {
          const result = await handleAddGroupMember({
              groupId: group._id,
              username: newMember,
              setGroup,
          });

          // Call refreshGroups if it exists
          if (typeof refreshGroups === 'function') {
              refreshGroups();
          }
          setNewMember('');
      } catch (err) {
          console.error("Failed to add member:", err);
      }
  };

  const removeMember = async (username) => {
      try {
          const result = await handleRemoveGroupMember({
              groupId: group._id,
              username: newMember,
              setGroup,
          });

          // Call refreshGroups if it exists
          if (typeof refreshGroups === 'function') {
              refreshGroups();
          }
      } catch (err) {
          console.error("Failed to remove member:", err);
      }
  };

  const deleteGroup = async () => {
    await handleDeleteGroup({
      groupId: group._id,
      setGroup,
      onGroupDeleted
    });
    setShowGroupModal(false);
  };

  const members = Array.isArray(group?.members)
      ? group.members
      : [];

  const decryptedMessages = Array.isArray(messages)
      ? messages.map(msg => ({
        ...msg,
        text: (() => {
          if (!msg.text || msg.deleted) return '';
          try {
            return decrypt(msg.text);
          } catch (err) {
            console.error("Decryption failed for message:", msg.text);
            return '[Encrypted]'; // fallback text
          }
        })()
      }))
      : [];

  return (
      <div className="d-flex flex-column h-100">
        {/* Header */}
        <Row
            className="align-items-center border-bottom p-2 px-3 sticky-top bg-white"
            style={{
              cursor: "pointer",
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              zIndex: 100,
              marginLeft: 0,
              marginRight: 0,
              width: '100%'
            }}
            onClick={() => setShowGroupModal(true)}
        >
          <Col xs="auto" className="ps-1">
            <Avatar
                avatar={group.avatar}
                fallbackIcon={<Users size={30} />}
                size={AVATAR_SIZE}
            />
          </Col>
          <Col>
            <h5 className="mb-0 text-truncate">
              {group?.name || 'Group Chat'}
            </h5>
            <small className="text-muted d-flex align-items-center">
              <span className="me-1">Tap for info</span>
                <Badge bg="success" style={{ fontSize: '0.85em', padding: '0.3em 0.7em' }}>
                    {members.length} member{members.length !== 1 ? 's' : ''}
                </Badge>
            </small>
          </Col>
        </Row>

        {/* Messages */}
        <div className="flex-grow-1 overflow-auto d-flex flex-column justify-content-end px-0">
          <MessageList
              messages={decryptedMessages}
              currentUser={currentUser}
              onDeleteMessage={(msg) => {
                  if (onDeleteMessage) {
                      onDeleteMessage(msg, group._id);
                  }
              }}
              onReplyMessage={onReplyMessage}
          />
        </div>

        {/* Composer */}
        <div className="p-3 border-top bg-white chat-input-wrapper">
          <MessageInput
              onSend={onSendMessage}
              replyTo={replyTo}
              onCancelReply={onCancelReply}
          />
        </div>

        {/* Group Info Modal */}
        <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Group Information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center mb-4">
              <Avatar
                  avatar={group?.avatar}
                  fallbackIcon={<Users size={48} />}
                  size={80}
                  className="mb-2"
              />
              <h4>{group?.name}</h4>
            </div>

            {/* Add member form */}
            <Form onSubmit={addMember} className="mb-4">
              <Form.Group className="d-flex">
                <Form.Control
                    type="text"
                    placeholder="Add member by username"
                    value={newMember}
                    onChange={(e) => setNewMember(e.target.value)}
                    className="me-2"
                />
                <Button type="submit" variant="outline-primary">
                  <UserPlus size={18} />
                </Button>
              </Form.Group>
            </Form>

            <h6 className="mb-2">Members</h6>
            <ListGroup className="mb-4">
              {members.map((member) => {
                const username = member.username || member;
                const isCurrentUser = username === currentUser?.username;

                return (
                    <ListGroup.Item
                        key={username}
                        className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        {username} {isCurrentUser && <Badge bg="secondary">you</Badge>}
                      </div>
                      {!isCurrentUser && (
                          <Button
                              size="sm"
                              variant="outline-danger"
                              onClick={() => removeMember(username)}
                          >
                            <UserMinus size={16} />
                          </Button>
                      )}
                    </ListGroup.Item>
                );
              })}
            </ListGroup>
          </Modal.Body>
          <Modal.Footer className="justify-content-between">
            <Button
                variant="danger"
                onClick={deleteGroup}
            >
              <Trash2 size={16} className="me-2" />
              Delete Group
            </Button>
            <Button
                variant="secondary"
                onClick={() => setShowGroupModal(false)}
            >
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
  );
};

export default GroupChat;
