// components/Layout/ChatLayout.js
import { Col, Row } from "react-bootstrap";
import ContactsList from "@components/chat/ContactsList";

const ChatLayout = ({user, contactsList, selectedContact, onSelectContact, children}) => {
    return (
        <Row className="mt-3" style={{ minHeight: "70vh" }}>
            <Col md={3}>
                <ContactsList
                    user={user}
                    contacts={contactsList}
                    selectedContact={selectedContact}
                    onSelectContact={onSelectContact}
                />
            </Col>
            <Col
                md={9}
                className="d-flex flex-column"
                style={{
                    background: "#f4f6fa",
                    borderRadius: "12px",
                    minHeight: "60vh",
                    maxHeight: "80vh",
                    height: "75vh",
                    boxShadow: '0 2px 16px rgba(0,0,0,0.04)',
                    padding: "0"
                }}
            >
                {children}
            </Col>
        </Row>
    );
};

export default ChatLayout;