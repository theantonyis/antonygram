import { useEffect } from "react";
import api from '@/utils/axios';

export default function useContacts(onlineUsers, setContactsList) {
    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await api.get('/contacts');
                setContactsList(
                    res.data.contacts.map((c) => ({
                        ...c,
                        online: onlineUsers.includes(c.username),
                    }))
                );
            } catch (error) {
                console.error('Failed to fetch contacts', error);
            }
        };

        fetchContacts();
    }, [onlineUsers, setContactsList]);
}