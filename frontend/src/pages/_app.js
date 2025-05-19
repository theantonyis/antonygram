import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { jwtDecode } from 'jwt-decode';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {
    const router = useRouter();
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);

    useEffect(() => {
        if (!router.isReady) return;

        const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('token='))
            ?.split('=')[1];

        const isLoginPage = router.pathname === '/login';
        const isRegisterPage = router.pathname === '/register';
        const isRootPage = router.pathname === '/';

        let warningTimeout, logoutTimeout;

        if (token) {
            try {
                const decoded = jwtDecode(token);
                const now = Math.floor(Date.now() / 1000);

                if (decoded.exp && decoded.exp > now) {
                    const expiresInSec = decoded.exp - now;
                    const warningTime = expiresInSec - 60;

                    if (warningTime > 0) {
                        warningTimeout = setTimeout(() => {
                            toast.warning('Session will expire in 1 minute.', {
                                position: 'top-right',
                                autoClose: 5000,
                            });
                        }, warningTime * 1000);
                    }

                    logoutTimeout = setTimeout(() => {
                        toast.error('Session expired. Logging out...', {
                            position: 'top-right',
                            autoClose: 3000,
                        });

                        document.cookie = 'token=; Max-Age=0; path=/';
                        router.push('/login');
                    }, expiresInSec * 1000);

                    setIsCheckingAuth(false); // ✅ allow rendering
                } else {
                    router.push('/login');
                }
            } catch (err) {
                console.warn('Invalid token:', err.message);
                router.push('/login');
            }
        } else {
            if (!isLoginPage && !isRegisterPage && !isRootPage) {
                router.push('/login');
            } else {
                setIsCheckingAuth(false);
            }
        }

        return () => {
            clearTimeout(warningTimeout);
            clearTimeout(logoutTimeout);
        };
    }, [router, router.isReady, router.pathname]);

    if (isCheckingAuth) return null; // Prevent render until auth check is done

    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.svg" />
            </Head>
            <Component {...pageProps} />
            <ToastContainer />
        </>
    );
}

export default MyApp;
