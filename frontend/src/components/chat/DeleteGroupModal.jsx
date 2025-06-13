import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { Trash2 } from 'lucide-react';
import { handleDeleteGroup } from '@utils/chatHandlers';

const DeleteGroupModal = ({
    show,
    onHide,
    group,
    setGroup,
    onGroupDeleted,
    setGroups
}) => {
    const handleConfirmDelete = async () => {
        await handleDeleteGroup({
            groupId: group?._id,
            setGroup,
            onGroupDeleted,
            setGroups
        });
        onHide();
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdropClassName="modal-backdrop-dark"
            contentClassName="border-0"
        >
            <Modal.Header closeButton>
                <Modal.Title className="text-danger">Delete Group</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex align-items-center mb-4">
                    <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                        <Trash2 size={24} className="text-danger" />
                    </div>
                    <div>
                        <h5 className="mb-1">Are you sure you want to delete this group?</h5>
                        <p className="text-muted mb-0">
                            {group?.name ? `"${group.name}"` : "This group"} will be permanently deleted.
                        </p>
                    </div>
                </div>
                <p className="mb-0 text-danger fw-medium">
                    This action cannot be undone and all group messages will be lost.
                </p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button
                    variant="danger"
                    onClick={handleConfirmDelete}
                    className="d-flex align-items-center gap-2"
                >
                    <Trash2 size={16} />
                    Delete Group
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DeleteGroupModal;
