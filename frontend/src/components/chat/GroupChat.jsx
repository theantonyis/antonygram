import React from 'react';
import Avatar from '../common/Avatar';
import { Users } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Row, Col } from 'react-bootstrap';

const AVATAR_SIZE = 38;

const GroupChat = ({
  group,               // { _id, name, avatar, members: [username, ...] }
  messages,            // [{from, text, ...}]
  currentUser,
  onSendMessage,       // (text) => void
  onDeleteMessage,
  onReplyMessage,
  replyTo,
  onCancelReply
}) => {
  if (!group) {
    return <div className="text-center text-muted py-5">Select or create a group to start chatting.</div>;
  }

  return (
    <div className="d-flex flex-column h-100">
      {/* Header */}
      <Row className="align-items-center border-bottom p-3 mb-2" style={{ background: "#fff", minHeight: 70 }}>
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
            {Array.isArray(group.members) ? group.members.join(', ') : ""}
          </small>
        </Col>
      </Row>

      {/* Messages */}
      <div className="flex-grow-1 d-flex flex-column h-100" style={{ minHeight: 0 }}>
        <MessageList
          messages={messages}
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
    </div>
  );
};

export default GroupChat;
