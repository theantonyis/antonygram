import '../styles/globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function MyApp({ Component, pageProps }) {
    const router = useRouter();

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = document.cookie.split('; ').find(row => row.startsWith('token='));
            const isLoginPage = router.pathname === '/login';
            const isRegisterPage = router.pathname === '/register';

            // Redirect to /login if not logged in and not already on the login or register page
            if (!token && !isLoginPage && !isRegisterPage) {
                router.push('/login');
            }
        }
    }, [router]);

    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.svg" />
            </Head>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
