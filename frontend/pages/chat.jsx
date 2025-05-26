import React, {useState, useRef, useEffect} from 'react';
import { useRouter } from 'next/router';
import { Container, Button, Row, Col, Image } from 'react-bootstrap';
import Head from 'next/head';
import { LogOut, Users } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { hydrateMessages } from '@utils/hydrateMessage.js';
import useSocket from '@hooks/useSocket.js';
import useAuthUser from '@hooks/useAuthUser.js';
import useOnlineUsers from '@hooks/useOnlineUsers.js';
import useContacts from '@hooks/useContacts.js';
import useSocketMessages from '@hooks/useSocketMessages.js';
import useChatHistory from '@hooks/useChatHistory.js';
import useGroups from "@hooks/useGroups.js";
import ChatLayout from "@components/layout/ChatLayout.jsx";
import ChatHeader from '@components/chat/ChatHeader.jsx';
import MessageList from '@components/chat/MessageList.jsx';
import MessageInput from '@components/chat/MessageInput.jsx';
import GroupChat from '@components/chat/GroupChat.jsx';
import DeleteContactModal from '@components/chat/DeleteContactModal.jsx';
import ProfileSettingsModal from "@components/user/ProfileSettingsModal.jsx";
import api from '@utils/axios.js';

import {
    handleLogout,
    handleSend,
    handleClear,
    handleDeleteContact,
    handleAddContact,
    selectContact,
    handleDeleteMessage,
    handleReplyMessage,
    handleGroupDeleted
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
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [showContacts, setShowContacts] = useState(false);
    const [unreadCounts, setUnreadCounts] = useState({});
    const [replyTo, setReplyTo] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const { groups, refreshGroups } = useGroups();

    const selectedContactRef = useRef(selectedContact);


    useOnlineUsers(socket, user, setOnlineUsers);
    useContacts(onlineUsers, setContactsList);
    useChatHistory(selectedContact, chatHistory, setMessages, setChatHistory);
    useSocketMessages(socket, user, selectedContactRef, setChatHistory, setMessages, unreadCounts, setUnreadCounts);

    const onLogout = () => handleLogout(router);

    const onSend = (text, fileData) => {
        handleSend({
            input: text,
            selectedContact,
            user,
            socket,
            setInput,
            setMessages,
            setChatHistory,
            replyTo,
            file: fileData,
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

  const onSelectContact = async (contact) => {
      selectContact({
          contact,
          setSelectedContact,
          setMessages,
          chatHistory,
          socket,
          user
      });

      if (!contact.groupId) {
          setSelectedGroup(null);
      }

      if (contact.groupId) {
          try {
              const res = await api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/groups/${contact.groupId}`);
              setSelectedGroup(res.data); // Set the latest group object
          } catch (err) {
              setSelectedGroup(null); // Ensure reset if fails
              console.error('Error fetching group info:', err);
          }
      }

      setUnreadCounts(prev => ({
          ...prev,
          [contact.username || contact.groupId]: 0 // Reset both user and group unread counts
      }));
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

  const onGroupDeleted = (groupId) =>
    handleGroupDeleted({
        groupId,
        selectedContact,
        setGroups,
        setSelectedContact
    });


    const handleUserUpdate = (updatedUser) => {
        const oldUsername = user.username;
        const newUsername = updatedUser.username;

        // Update the user object in local state
        if (user) {
            Object.assign(user, {
                avatar: updatedUser.avatar,
                username: updatedUser.username
            });
        }

        // Update contact list if username changed
        if (oldUsername !== newUsername) {
            setContactsList(prevContacts =>
                prevContacts.map(contact => {
                    if (contact.username === oldUsername) {
                        return { ...contact, username: newUsername };
                    }
                    return contact;
                })
            );

            // Update chat history keys
            setChatHistory(prevHistory => {
                const updatedHistory = {};
                // Copy all existing conversations except the old username one
                Object.keys(prevHistory).forEach(key => {
                    if (key !== oldUsername) {
                        updatedHistory[key] = prevHistory[key];
                    }
                });

                // If there was a conversation with the old username, move it to the new username
                if (prevHistory[oldUsername]) {
                    updatedHistory[newUsername] = prevHistory[oldUsername];
                }

                return updatedHistory;
            });
        }

        // Rest of your existing code for updating messages...
        setMessages(prevMessages => prevMessages.map(msg => {
            if (msg.from === oldUsername) {
                return {
                    ...msg,
                    from: newUsername,
                    senderAvatar: updatedUser.avatar
                };
            }
            return msg;
        }));

        // Update the header avatar using the ref approach for reliability
        const headerImage = document.querySelector('img[alt="User Avatar"]');
        if (headerImage) {
            headerImage.src = updatedUser.avatar || DEFAULT_AVATAR;
        }

        // Force refresh if username changed - usernames are referenced throughout the database
        if (oldUsername !== newUsername) {
            window.location.reload();
        }
    };

  const hydratedMessages = hydrateMessages(messages);

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
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowProfileModal(true)}
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
              onGroupDeleted={onGroupDeleted}
              refreshGroups={refreshGroups}
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
              selectedContact.groupId ? (
                      <GroupChat
                          group={selectedGroup}
                          setGroup={setSelectedGroup}
                          messages={chatHistory[selectedContact.groupId] || []}
                          refreshGroups={refreshGroups}
                          currentUser={user}
                          onSendMessage={text => {
                              handleSend({
                                  input: text,
                                  selectedContact,
                                  user,
                                  socket,
                                  setInput,
                                  setMessages,
                                  setChatHistory,
                                  replyTo,
                                  isGroup: true, // Add this flag for clarity in your handler
                              });
                              setReplyTo(null);
                          }}
                          onDeleteMessage={msg =>
                              handleDeleteMessage({
                                  msgToDelete: msg,
                                  selectedContact,
                                  setChatHistory,
                                  setMessages,
                              })
                          }
                          onReplyMessage={msg => setReplyTo(msg)}
                          replyTo={replyTo}
                          onCancelReply={() => setReplyTo(null)}
                      />
                ) : (
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
              )
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
        <ProfileSettingsModal
            show={showProfileModal}
            onHide={() => setShowProfileModal(false)}
            user={user}
            onUserUpdate={handleUserUpdate}
        />
    </>
  );
};

export default Chat;
