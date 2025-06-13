// components/chat/DeleteGroupModal.jsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteGroupModal = ({ show, group, onHide, onConfirm }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Delete Group</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>
                    Are you sure you want to delete the group <strong>"{group?.name}"</strong>?
                </p>
                <p className="text-danger mb-0">
                    This action cannot be undone, and all messages will be permanently deleted.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Delete Group
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteGroupModal;
