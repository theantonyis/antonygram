import React, { useState, useEffect, useRef } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';
import Avatar from './Avatar';
import api from '@utils/axios';

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * A search field that queries users from the database
 *
 * @param {Object} props
 * @param {string} props.placeholder - Placeholder text for the input
 * @param {string} props.value - Current search value
 * @param {function} props.onChange - Function to call when search value changes
 * @param {function} props.onUserSelect - Function to call when a user is selected
 * @param {Array<string>} props.excludeUsernames - Usernames to exclude from results
 */
const UserSearchField = ({
                             placeholder = "Search users...",
                             value,
                             onChange,
                             onUserSelect,
                             excludeUsernames = []
                         }) => {
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const resultContainerRef = useRef(null);

    useEffect(() => {
        // Create a debounce function to avoid excessive API calls
        const timeoutId = setTimeout(async () => {
            if (!value || value.trim().length < 2) {
                setSearchResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get(
                    `${backendURL}/api/users/search?q=${encodeURIComponent(value.trim())}`
                );

                // Filter out excluded usernames
                const filteredResults = response.data.users.filter(
                    user => !excludeUsernames.includes(user.username)
                );
                setSearchResults(filteredResults);
            } catch (error) {
                console.error("User search failed:", error);
                setSearchResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [value, excludeUsernames]);

    // Handle click outside to close results
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultContainerRef.current && !resultContainerRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectUser = (user) => {
        if (onUserSelect) {
            onUserSelect(user);
        }
        setShowResults(false);
    };

    return (
        <div className="position-relative" ref={resultContainerRef}>
            <Form.Control
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onFocus={() => setShowResults(true)}
                autoComplete="off"
            />

            {showResults && value?.trim().length > 1 && (
                <ListGroup
                    className="position-absolute w-100 mt-1 shadow-sm z-3"
                    style={{
                        maxHeight: '200px',
                        overflowY: 'auto',
                        zIndex: 100
                    }}
                >
                    {loading ? (
                        <ListGroup.Item className="text-center py-2">
                            <Spinner animation="border" size="sm" className="me-2" />
                            Searching...
                        </ListGroup.Item>
                    ) : searchResults.length > 0 ? (
                        searchResults.map(user => (
                            <ListGroup.Item
                                key={user._id || user.username}
                                action
                                onClick={() => handleSelectUser(user)}
                                className="d-flex align-items-center"
                            >
                                <Avatar
                                    avatar={user.avatar}
                                    size={28}
                                    className="me-2"
                                />
                                <div className="ms-2">
                                    <div>{user.username}</div>
                                    {(user.name || user.surname) && (
                                        <small className="text-muted">
                                            {[user.name, user.surname].filter(Boolean).join(' ')}
                                        </small>
                                    )}
                                </div>
                            </ListGroup.Item>
                        ))
                    ) : (
                        <ListGroup.Item className="text-muted">
                            No users found
                        </ListGroup.Item>
                    )}
                </ListGroup>
            )}
        </div>
    );
};

export default UserSearchField;
