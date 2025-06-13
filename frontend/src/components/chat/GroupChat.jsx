import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import { Users, UserPlus, UserMinus, Trash2 } from 'lucide-react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import GroupHeader from './GroupHeader';
import GroupInfoModal from './GroupInfoModal';
import { Row, Col, Button, Form, Modal, ListGroup, Badge } from 'react-bootstrap';
import { handleAddGroupMember, handleDeleteGroup, handleRemoveGroupMember } from '@utils/chatHandlers';
import { hydrateMessages } from '@utils/hydrateMessage.js';

const AVATAR_SIZE = 38;

const GroupChat = ({
                       group,
                       setGroup,
                       messages,
                       currentUser,
                       onSendMessage,
                       onDeleteMessage,
                       onReplyMessage,
                       replyTo,
                       onCancelReply,
                       onDeleteGroup,
                       onGroupDeleted,
                       refreshGroups
                   }) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (!group) {
    return <div className="text-center text-muted py-5">Select or create a group to start chatting.</div>;
  }

    // Add member handler
    const handleAddMember = async (username) => {
        await handleAddGroupMember({
            groupId: group._id,
            username,
            setGroup
        });
        refreshGroups();
    };

    // Remove member handler
    const handleRemoveMember = async (username) => {
        await handleRemoveGroupMember({
            groupId: group._id,
            username,
            setGroup
        });
        refreshGroups();
    };

    // Leave group handler (removes self)
    const handleLeaveGroup = async () => {
        await handleRemoveGroupMember({
            groupId: group._id,
            username: currentUser.username,
            setGroup
        });
        refreshGroups();
        setGroup(null);
        setShowInfoModal(false);
        if (onGroupDeleted) onGroupDeleted(group._id);
    };

    // Delete group handler (only for creator)
    const handleDeleteGroupClick = async () => {
        await handleDeleteGroup({
            groupId: group._id,
            setGroup,
            onGroupDeleted
        });
        refreshGroups();
        setShowInfoModal(false);
    };

  const hydratedMessages = hydrateMessages(Array.isArray(messages) ? messages : []);

  return (
      <div className="d-flex flex-column h-100">
        {/* Header */}
          <div className="px-3 pt-3 pb-0">
              <GroupHeader
                  group={group}
                  onShowInfoModal={() => setShowInfoModal(true)}
              />
          </div>

        {/* Messages */}
        <div className="flex-grow-1 overflow-auto d-flex flex-column justify-content-end px-0">
          <MessageList
              messages={hydratedMessages}
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
          <GroupInfoModal
              show={showInfoModal}
              onHide={() => setShowInfoModal(false)}
              group={group}
              setGroup={setGroup}
              currentUser={currentUser}
              onDeleteGroup={onDeleteGroup}
              refreshGroups={refreshGroups}
          />
      </div>
  );
};

export default GroupChat;
