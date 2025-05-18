import nookies from 'nookies';

export const getToken = (ctx = null) => {
    // ctx — це контекст Next.js (req/res) або null (браузер)
    const cookies = nookies.get(ctx);
    return cookies.token || '';
};
