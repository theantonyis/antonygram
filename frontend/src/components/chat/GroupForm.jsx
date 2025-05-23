import React, { useState } from 'react';
import { Modal, Button, Form, ListGroup, InputGroup } from 'react-bootstrap';
import { Users, UserPlus, UserMinus, PlusCircle } from 'lucide-react';
import api from '@utils/axios.js';

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

// You'll want to pass your contacts as a prop to this component!
const GroupCreationForm = ({ show, onHide, contacts = [], onGroupCreated, user }) => {
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [avatar, setAvatar] = useState(null);

    // Filter contacts by search term
    const filteredContacts = contacts.filter(
        contact =>
            contact.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !selectedMembers.some(m => m._id === contact._id)
    );

    const handleAddMember = (contact) => {
        if (!contact._id && !contact.id) {
            alert("Contact does not have a valid ID and cannot be added to a group.");
            return;
        }
        setSelectedMembers([...selectedMembers, contact]);
    };

    const handleRemoveMember = (contact) => {
        setSelectedMembers(selectedMembers.filter(m => m._id !== contact._id));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Prepare only IDs for backend
        const memberIds = selectedMembers.map(m => m._id);

        if (user && !memberIds.includes(user._id)) {
            memberIds.push(user._id);
        }

        const data = {
            name: groupName,
            members: memberIds,
            // Omit avatar if not set or leave as undefined
        };

        try {
            // Adjust the URL if needed for your API
            const resp = await api.post(`${backendURL}/api/groups`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("Created group:", resp.data);
            setGroupName('');
            setSelectedMembers([]);
            if (onGroupCreated) onGroupCreated();
            onHide();
        } catch (err) {
            alert('Failed to create group');
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <Users size={22} className="me-2" /> Create Group
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            <PlusCircle size={16} className="me-1" /> Group Name
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            required
                            placeholder="Enter group name"
                        />
                    </Form.Group>

                    <Form.Group className="mb-2">
                        <Form.Label>
                            <UserPlus size={16} className="me-1" /> Add Members
                        </Form.Label>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Search contacts..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </InputGroup>
                    </Form.Group>

                    <ListGroup className="mb-2">
                        {filteredContacts.map(contact => (
                            <ListGroup.Item key={contact._id}>
                                {contact.username}
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="float-end"
                                    onClick={() => handleAddMember(contact)}
                                    title="Add member"
                                >
                                    <UserPlus size={17} />
                                </Button>
                            </ListGroup.Item>
                        ))}
                        {filteredContacts.length === 0 && (
                            <div className="text-muted small px-2">No contacts found</div>
                        )}
                    </ListGroup>

                    <div>
                        <Form.Label>
                            <Users size={16} className="me-1" /> Selected Members
                        </Form.Label>
                        <ListGroup>
                            {selectedMembers.map(member => (
                                <ListGroup.Item key={member._id}>
                                    {member.username}
                                    <Button
                                        variant="link"
                                        size="sm"
                                        className="float-end text-danger"
                                        onClick={() => handleRemoveMember(member)}
                                        title="Remove member"
                                    >
                                        <UserMinus size={17} />
                                    </Button>
                                </ListGroup.Item>
                            ))}
                            {selectedMembers.length === 0 && (
                                <div className="text-muted small px-2">No members added yet</div>
                            )}
                        </ListGroup>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={onHide}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={!groupName || selectedMembers.length === 0}>
                        <Users size={16} className="me-2" /> Create Group
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default GroupCreationForm;
