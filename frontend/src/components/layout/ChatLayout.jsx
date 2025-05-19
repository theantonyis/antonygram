// components/Layout/ChatLayout.js
import { Col, Row } from "react-bootstrap";
import ContactsList from "@components/chat/ContactsList";

const ChatLayout = ({user, contactsList, selectedContact, onSelectContact, children}) => {
    return (
        <Row className="mt-3">
            <Col md={3}>
                <ContactsList
                    user={user}
                    contacts={contactsList}
                    selectedContact={selectedContact}
                    onSelectContact={onSelectContact}
                />
            </Col>
            <Col md={9}>
                {children}
            </Col>
        </Row>
    );
};

export default ChatLayout;
