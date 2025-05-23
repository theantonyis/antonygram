import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import { Users } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Row, Col, Button, InputGroup, FormControl, Modal } from 'react-bootstrap';
import {handleAddGroupMember, handleDeleteGroup, handleRemoveGroupMember} from '@utils/chatHandlers';
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
  onGroupDeleted
}) => {
  const [memberName, setMemberName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!group) {
    return <div className="text-center text-muted py-5">Select or create a group to start chatting.</div>;
  }

  // Used for demo: Only show member controls if the current user is a member
  const isMember = Array.isArray(group.members)
      ? group.members.some(m => (m.username || m) === currentUser?.username)
      : false;

  // Determine member count robustly (include current user if not present)
  let memberCount = Array.isArray(group.members) ? group.members.length : 0;
  if (
    currentUser &&
    Array.isArray(group.members) &&
    !group.members.some(m => (m.username || m) === currentUser.username)
  ) {
    memberCount += 1;
  }

  const handleAdd = async () => {
    if (!memberName.trim()) return;
    setLoading(true);
    await handleAddGroupMember({ groupId: group._id, username: memberName.trim(), setGroup });
    setMemberName('');
    setLoading(false);
  };

  const decryptedMessages = Array.isArray(messages)
      ? messages.map(msg => ({
        ...msg,
        text: (() => {
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
          className="align-items-center border-bottom p-3 mb-2"
          style={{ background: "#fff", minHeight: 70, cursor: "pointer" }}
          onClick={() => setShowGroupModal(true)}
      >
      <Col xs="auto">
          <Avatar
            avatar={group.avatar}
            fallbackIcon={<Users size={30} />}
            size={AVATAR_SIZE}
          />
        </Col>
        <Col>
          <strong className="d-block">{group.name}</strong>
          <small className="text-muted">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {showMembers && (
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: '120%',
                    zIndex: 1050,
                    minWidth: 180,
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: 8,
                    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                    padding: 10,
                    fontSize: 13,
                  }}
                  onMouseLeave={() => setShowMembers(false)}
                >
                  <div className="fw-bold mb-2" style={{fontSize: 14}}>Group Members</div>
                  {Array.isArray(group.members) && group.members.length > 0 ? (
                    <ul className="list-unstyled mb-0">
                      {group.members.map((m, idx) => (
                        <li key={m._id || m.id || idx} className="mb-1 d-flex align-items-center">
                          <span className="fw-semibold small">{m.username || m}</span>
                          {m.email && <span className="text-muted small ms-2">{m.email}</span>}
                        </li>
                      ))}
                      {/* Show current user if not in members */}
                      {!group.members.some(m => (m.username || m) === currentUser.username) && (
                        <li className="mb-1 d-flex align-items-center">
                          <span className="fw-semibold small">{currentUser.username}</span>
                          {currentUser.email && <span className="text-muted small ms-2">{currentUser.email}</span>}
                        </li>
                      )}
                    </ul>
                  ) : (
                    <div className="text-muted small">No members found.</div>
                  )}
                </div>
              )}
            </div>
          </small>
        </Col>
      </Row>

      <Modal show={showGroupModal} onHide={() => setShowGroupModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Manage Group: {group.name}</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <div className="mb-3">
            <strong className="d-block mb-2">Members ({memberCount}):</strong>
            <ul className="list-group list-group-flush">
              {Array.isArray(group.members) && group.members.length > 0 ? (
                  group.members.map((m, idx) => {
                    const username = m.username || m;
                    const email = m.email;
                    return (
                        <li
                            key={m._id || m.id || idx}
                            className="list-group-item d-flex justify-content-between align-items-center px-2 py-1"
                        >
                          <div>
                            <span className="fw-semibold">{username}</span>
                            {email && <span className="text-muted small ms-2">{email}</span>}
                          </div>
                          {isMember && username !== currentUser.username && (
                              <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={async () => {
                                    setLoading(true);
                                    await handleRemoveGroupMember({ groupId: group._id, username, setGroup });
                                    setLoading(false);
                                  }}
                              >
                                Remove
                              </Button>
                          )}
                        </li>
                    );
                  })
              ) : (
                  <li className="list-group-item text-muted py-1 px-2">No members found.</li>
              )}
            </ul>
          </div>

          {isMember && (
              <InputGroup className="mb-3" size="sm">
                <FormControl
                    placeholder="Add member (username)"
                    value={memberName}
                    onChange={e => setMemberName(e.target.value)}
                    disabled={loading}
                />
                <Button
                    variant="success"
                    onClick={handleAdd}
                    disabled={loading || !memberName.trim()}
                >
                  Add
                </Button>
              </InputGroup>
          )}
        </Modal.Body>

        {isMember && (
            <Modal.Footer>
              <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => {
                    handleDeleteGroup({
                      groupId: group._id,
                      setGroup,
                      onGroupDeleted: () => {
                        setShowDeleteModal(false);
                        onGroupDeleted?.(group._id); // ✅ callback to parent
                      },
                    });
                  }}
              >
                Delete Group
              </Button>
            </Modal.Footer>
        )}
      </Modal>

      {/* Messages */}
      <div className="flex-grow-1 d-flex flex-column h-100" style={{ minHeight: 0 }}>
        <MessageList
          messages={decryptedMessages}
          currentUser={currentUser}
          onDeleteMessage={onDeleteMessage}
          onReplyMessage={onReplyMessage}
        />
      </div>

      {/* Composer */}
      <div className="p-3 border-top bg-white" style={{ marginTop: "auto" }}>
        <MessageInput
          onSend={onSendMessage}
          replyTo={replyTo}
          onCancelReply={onCancelReply}
        />
      </div>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Group</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ overflowY: 'auto', maxHeight: '60vh', paddingBottom: '1rem' }}>
          Are you sure you want to delete the group <strong>{group?.name}</strong>? This action cannot be undone.
        </Modal.Body>

        <Modal.Footer style={{ flexShrink: 0 }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button
              variant="danger"
              onClick={() => {
                handleDeleteGroup({
                  groupId: group._id,
                  setGroup,
                  onGroupDeleted: () => {
                    setShowDeleteModal(false);
                    onGroupDeleted?.(group._id);
                  },
                });
              }}
          >
            Delete Group
          </Button>
        </Modal.Footer>
      </Modal>
    </div>

  );
};

export default GroupChat;
