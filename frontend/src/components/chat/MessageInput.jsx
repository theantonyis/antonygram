// components/Chat/MessageInput.js
import React, { useState } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Send } from 'react-bootstrap-icons';

const MessageInput = ({ onSend, replyTo, onCancelReply }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text);
        setText('');
    };

    return (
        <Form onSubmit={handleSubmit}>
            {replyTo && (
              <div className="alert alert-info py-1 px-2 mb-2 d-flex justify-content-between align-items-center">
                <span>
                  Replying to <strong>{replyTo.from}</strong>: {replyTo.text.length > 36 ? replyTo.text.slice(0,36) + '…' : replyTo.text}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="ms-2 p-0"
                  style={{ textDecoration: "none", fontSize: '1.2em', lineHeight: '0.7' }}
                  onClick={onCancelReply}
                  tabIndex={-1}
                >&times;</Button>
              </div>
            )}
            <InputGroup>
                <Form.Control
                    type="text"
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <Button type="submit" variant="primary">
                    <Send />
                </Button>
            </InputGroup>
        </Form>
    );
};

export default MessageInput;
