// components/common/Avatar.js
import React from 'react';
import { Image } from 'react-bootstrap';

const Avatar = ({ avatar, size = 32 }) => (
    <Image
        src={avatar || '/def-avatar.png'}
        roundedCircle
        width={size}
        height={size}
        onError={(e) => { e.target.onerror = null; e.target.src = '/def-avatar.png'; }}
        alt="Avatar"
    />
);

export default Avatar;
