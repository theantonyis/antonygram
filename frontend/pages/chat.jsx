import React, {useState, useRef, useEffect} from 'react';
import { useRouter } from 'next/router';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';
import Head from 'next/head';
import { LogOut, Users } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { hydrateMessages } from '@utils/hydrateMessage.js';
import useSocket from '../src/hooks/useSocket.js';
import useAuthUser from '../src/hooks/useAuthUser.js';
import useOnlineUsers from '../src/hooks/useOnlineUsers.js';
import useContacts from '../src/hooks/useContacts.js';
import useSocketMessages from '../src/hooks/useSocketMessages.js';
import useChatHistory from '../src/hooks/useChatHistory.js';
import ChatLayout from "@components/layout/ChatLayout.jsx";
import ChatHeader from '@components/chat/ChatHeader.jsx';
import MessageList from '@components/chat/MessageList.jsx';
import MessageInput from '@components/chat/MessageInput.jsx';
import DeleteContactModal from '@components/chat/DeleteContactModal.jsx';

import {
  handleLogout,
  handleSend,
  handleClear,
  handleDeleteContact,
  handleAddContact,
  selectContact,
  handleDeleteMessage,
  handleReplyMessage
} from '@utils/chatHandlers.js';

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
    const [showContacts, setShowContacts] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [replyTo, setReplyTo] = useState(null);

    const selectedContactRef = useRef(selectedContact);


    useOnlineUsers(socket, user, setOnlineUsers);
    useContacts(onlineUsers, setContactsList);
    useChatHistory(selectedContact, chatHistory, setMessages, setChatHistory);
    useSocketMessages(socket, user, selectedContactRef, setChatHistory, setMessages, unreadCounts, setUnreadCounts);

    const onLogout = () => handleLogout(router);

    const onSend = (text) => {
        handleSend({
            input: text,
            selectedContact,
            user,
            socket,
            setInput,
            setMessages,
            setChatHistory,
            replyTo,
        });
        setReplyTo(null);
    };

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

  const onSelectContact = (contact) => {
      selectContact({
          contact,
          setSelectedContact,
          setMessages,
          chatHistory,
          socket,
          user
      });
      if (contact && setUnreadCounts) {
          setUnreadCounts(prev => ({
              ...prev,
              [contact.username]: 0,
          }));
      }
  };

    // Replace onDeleteMessage to use the cascade function instead:
    const onDeleteMessage = (msg) =>
        handleDeleteMessage({
            msgToDelete: msg,
            selectedContact,
            setChatHistory,
            setMessages,
    });

  const onReplyMessage = (msg) =>
    handleReplyMessage({
        msg,
        setReplyTo,
    });

  const hydratedMessages = hydrateMessages(chatHistory[selectedContact?.username] || []);

  useEffect(() => {
        selectedContactRef.current = selectedContact;
  }, [selectedContact]);


    return (
    <>
      <Head>
        <title>Chat | antonygram</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Container fluid className="p-4" style={{ minHeight: '100vh', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Row className="mb-4 align-items-center d-none d-md-flex">
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
              onlineUsers={onlineUsers}
              addContactInput={addContactInput}
              setAddContactInput={setAddContactInput}
              unreadCounts={unreadCounts}
              onAddContact={onAddContact}
              onClearChat={onClearChat}
              onDeleteContact={onDeleteContact}
              showContacts={showContacts}
              setShowContacts={setShowContacts}
          >
          <ToastContainer position="top-right" autoClose={3000} />
          <div className="d-flex align-items-center justify-content-between py-2 px-3 d-flex d-md-none" style={{ marginTop: 8 }}>
            <div className="d-flex align-items-center gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2"
                  style={{ minWidth: 32 }}
                  onClick={() => setShowContacts(true)}
                  aria-label="Show contacts"
                >
                  <Users size={20} />
                </Button>
                <Image
                  src={user?.avatar || DEFAULT_AVATAR}
                  alt="User Avatar"
                  roundedCircle
                  width={32}
                  height={32}
                />
                <span className="fw-bold">{user?.username}</span>
            </div>
            <Button variant="outline-danger" size="sm" onClick={onLogout}>
                <LogOut size={16} />
            </Button>
          </div>
          {selectedContact ? (
            <>
            <div className="px-3 pt-3 pb-0">
              <ChatHeader
                contact={{
                  ...selectedContact,
                  isOnline: onlineUsers.includes(selectedContact.username),
                }}
              />
            </div>
              <div className="flex-grow-1 overflow-auto d-flex flex-column justify-content-end px-0">
                <MessageList
                    messages={hydratedMessages}
                    currentUser={user}
                    onDeleteMessage={onDeleteMessage}
                    onReplyMessage={onReplyMessage}
                />
              </div>
              <div className="p-3 border-top bg-white chat-input-wrapper" style={{ position: "relative" }}>
                <MessageInput
                    onSend={onSend}
                    replyTo={replyTo}
                    onCancelReply={() => setReplyTo(null)}
                />
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
