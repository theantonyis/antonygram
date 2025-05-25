import { useCallback, useEffect , useRef, useState } from "react";
import api from "@utils/axios";

const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Fetches groups from the backend and updates the provided setter.
 *
 * @param {function} setGroups - Function to set the groups array in your component.
 */
export default function useGroups() {
    const [groups, setGroups] = useState([]);
    const fetchingRef = useRef(false);

    const refreshGroups = useCallback(async () => {
        if (fetchingRef.current) return;
        fetchingRef.current = true;
        try {
            const res = await api.get(`${backendURL}/api/groups`);
            setGroups(res.data); // or setGroups(res.data.groups) if your API wraps array
        } catch (error) {
            console.error("Failed to fetch groups", error);
            setGroups([]); // Optionally clear groups on error
        } finally {
            fetchingRef.current = false;
        }
    }, [setGroups]);

    useEffect(() => {
        refreshGroups();
    }, [refreshGroups]);

    // Return the refresh function
    return { groups, refreshGroups };
}
