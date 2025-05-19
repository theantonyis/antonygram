// components/common/DeleteConfirmationModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const DeleteContactModal = ({ show, contact, onHide, onConfirm }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Delete</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                Are you sure you want to delete contact <strong>{contact ? contact.username : ''}</strong>? This will also clear the chat history.
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="danger" onClick={onConfirm}>Delete</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteContactModal;
