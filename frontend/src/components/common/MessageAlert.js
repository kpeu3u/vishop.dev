import React from 'react';
import { Alert } from 'react-bootstrap';

const MessageAlert = ({ message, variant = 'success', onClose }) => {
    if (!message) return null;

    return (
        <Alert variant={variant} dismissible onClose={onClose} className="mb-3">
            {message}
        </Alert>
    );
};

export default MessageAlert;
