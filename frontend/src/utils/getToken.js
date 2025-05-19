import { getCookie } from 'cookies-next';

export const getToken = (ctx = null) => {
    return getCookie('token', { req: ctx?.req, res: ctx?.res }) || '';
};
