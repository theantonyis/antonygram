import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';
import Head from 'next/head';
import { LogOut } from 'lucide-react';
import useSocket from '../hooks/useSocket';
import useAuthUser from '../hooks/useAuthUser';
import useOnlineUsers from '../hooks/useOnlineUsers';
import useContacts from '../hooks/useContacts';
import useSocketMessages from '../hooks/useSocketMessages';
import useChatHistory from '../hooks/useChatHistory';
import ChatLayout from "@components/layout/ChatLayout";
import ChatHeader from '@components/chat/ChatHeader';
import MessageList from '@components/chat/MessageList';
import MessageInput from '@components/chat/MessageInput';
import DeleteContactModal from '@components/chat/DeleteContactModal';

import {
  handleLogout,
  handleSend,
  handleClear,
  handleDeleteContact,
  handleAddContact,
  selectContact
} from '@utils/chatHandlers';

const DEFAULT_AVATAR = '/def-avatar.png';

const Chat = () => {
  const router = useRouter();
  const socket = useSocket();
  const user = useAuthUser(router);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [contactsList, setContactsList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [chatHistory, setChatHistory] = useState({});
  const [addContactInput, setAddContactInput] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  useOnlineUsers(socket, user, setOnlineUsers);
  useContacts(onlineUsers, setContactsList);
  useChatHistory(selectedContact, chatHistory, setMessages, setChatHistory);
  useSocketMessages(socket, user, selectedContact, setChatHistory, setMessages);

  const onLogout = () => handleLogout(router);

  const onSend = (text) =>
    handleSend({
      input: text,
      selectedContact,
      user,
      socket,
      setInput
    });

  const onClearChat = (contact) =>
    handleClear({
      contact,
      selectedContact,
      setChatHistory,
      setMessages
    });

  const onDeleteContact = async (contact) => {
    setContactToDelete(contact);
    setShowDeleteModal(true);
  };

  const onConfirmDeleteContact = async () => {
    if (contactToDelete) {
      await handleDeleteContact({
        contact: contactToDelete,
        selectedContact,
        setContactsList,
        setChatHistory,
        setSelectedContact,
        setMessages
      });
      setContactToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const onCloseDeleteModal = () => {
    setContactToDelete(null);
    setShowDeleteModal(false);
  };

  const onAddContact = (e) =>
    handleAddContact({
      e,
      search: addContactInput,
      setContactsList,
      setSelectedContact,
      setSearch: setAddContactInput
    });

  const onSelectContact = (contact) =>
    selectContact({
      contact,
      setSelectedContact,
      setMessages,
      chatHistory,
      socket,
      user
    });

  return (
    <>
      <Head>
        <title>Chat | antonygram</title>
      </Head>
      <Container fluid className="p-4" style={{ minHeight: '100vh' }}>
        <Row className="mb-4 align-items-center">
          <Col xs="auto" className="d-flex align-items-center">
            <Image
              src={user?.avatar || DEFAULT_AVATAR}
              alt="User Avatar"
              roundedCircle
              width={48}
              height={48}
              className="me-2"
            />
            <strong>{user?.username}</strong>
          </Col>
          <Col className="text-end">
            <Button variant="outline-danger" onClick={onLogout}>
              <LogOut size={16} /> Logout
            </Button>
          </Col>
        </Row>

        <ChatLayout
          user={user}
          contactsList={contactsList}
          selectedContact={selectedContact}
          onSelectContact={onSelectContact}
        >
          {selectedContact ? (
            <>
              <ChatHeader
                contact={{
                  ...selectedContact,
                  isOnline: onlineUsers.includes(selectedContact.username),
                }}
              />
                <MessageList
                    messages={chatHistory[selectedContact.username] || []}
                    currentUser={user}
                />
              <div className="mt-3">
                <MessageInput onSend={onSend} />
              </div>
            </>
          ) : (
            <div className="text-muted text-center mt-5">
              Select a contact to start chatting.
            </div>
          )}
        </ChatLayout>
      </Container>
      <DeleteContactModal
        show={showDeleteModal}
        contact={contactToDelete}
        onHide={onCloseDeleteModal}
        onConfirm={onConfirmDeleteContact}
      />
    </>
  );
};

export default Chat;