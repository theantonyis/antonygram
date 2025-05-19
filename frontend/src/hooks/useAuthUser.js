import {useEffect, useState} from "react";

const DEFAULT_AVATAR = '/def-avatar.png';

export default function useAuthUser(router) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
        if (!tokenCookie) {
            router.push('/login');
            return;
        }

        try {
            const token = tokenCookie.split('=')[1];
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUser({ username: payload.username, avatar: payload.avatar || DEFAULT_AVATAR });
        } catch {
            setUser({ username: 'Guest', avatar: DEFAULT_AVATAR });
        }
    }, [router]);

    return user;
}