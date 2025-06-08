import {useEffect, useState} from "react";
import api from '@utils/axios';

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
            // First get basic auth info from token
            const token = tokenCookie.split('=')[1];
            const payload = JSON.parse(atob(token.split('.')[1]));

            // Set basic user info initially
            const basicUser = {
                userId: payload.userId,
                username: payload.username,
                avatar: payload.avatar || DEFAULT_AVATAR
            };
            setUser(basicUser);

            // Then fetch full user profile from MongoDB
            api.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/profile`)
                .then(response => {
                    // Update with complete user data from MongoDB
                    setUser({
                        ...basicUser,
                        name: response.data.name,
                        surname: response.data.surname,
                        avatar: response.data.avatar || DEFAULT_AVATAR
                    });
                })
                .catch(error => {
                    console.error('Failed to fetch user profile:', error);
                });
        } catch (error) {
            console.error('Error parsing token:', error);
            setUser({ username: 'Guest', avatar: DEFAULT_AVATAR });
        }
    }, [router]);

    return user;
}
