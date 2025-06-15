// components/Layout/ChatLayout.js
import {Col, Offcanvas, Row} from "react-bootstrap";
import ContactsList from "@components/chat/ContactsList";

const ChatLayout = ({user, contactsList, selectedContact, onSelectContact, onlineUsers, addContactInput, setAddContactInput, onAddContact, onClearChat, onDeleteContact, unreadCounts, setUnreadCounts, showContacts, setShowContacts, onGroupDeleted, children}) => {
    return (
        <Row className="flex-grow-1" style={{ flex: 1, minHeight: 0, height: "100%" }}>
            <Col xs={12} md={4} lg={3} className="d-none d-md-block">
                <ContactsList
                    user={user}
                    contacts={contactsList}
                    selectedContact={selectedContact}
                    onlineUsers={onlineUsers}
                    addContactInput={addContactInput}
                    setAddContactInput={setAddContactInput}
                    onGroupDeleted={onGroupDeleted}
                    onAddContact={onAddContact}
                    unreadCounts={unreadCounts}
                    setUnreadCounts={setUnreadCounts}
                    onSelectContact={onSelectContact}
                    onClearChat={onClearChat}
                    onDeleteContact={onDeleteContact}
                />
            </Col>
            <Offcanvas
                show={showContacts}
                onHide={() => setShowContacts(false)}
                className="d-block d-md-none"
                scroll={true}
            >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title>Contacts</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <ContactsList
                        user={user}
                        contacts={contactsList}
                        selectedContact={selectedContact}
                        onlineUsers={onlineUsers}
                        addContactInput={addContactInput}
                        setAddContactInput={setAddContactInput}
                        onGroupDeleted={onGroupDeleted}
                        onAddContact={onAddContact}
                        onSelectContact={(c) => {
                            onSelectContact(c);
                            setShowContacts(false); // Close after selecting
                        }}
                        onClearChat={onClearChat}
                        onDeleteContact={onDeleteContact}
                    />
                </Offcanvas.Body>
            </Offcanvas>
            <Col
                xs={12} md={8} lg={9}
                className="d-flex flex-column"
                style={{
                    background: "#f4f6fa",
                    borderRadius: "12px",
                    height: "100%",
                    minHeight: 0,
                    boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                    padding: "0",
                    flex: 1
                }}
            >
                {children}
            </Col>
        </Row>
    );
};

export default ChatLayout;
