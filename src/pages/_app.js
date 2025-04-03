import '../styles/globals.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        // Ensure the check is only done on the client side
        if (typeof window !== 'undefined') {
            // Check if the user is logged in (use your logic to check the session)
            const token = localStorage.getItem('token');
            const isLoginPage = router.pathname === '/login';
            const isRegisterPage = router.pathname === '/register';

            // Redirect to /login if not logged in and not already on the login or register page
            if (!token && !isLoginPage && !isRegisterPage) {
                router.push('/login');
            }
        }
    }, [router]);

    return <Component {...pageProps} />;
}

export default MyApp;
