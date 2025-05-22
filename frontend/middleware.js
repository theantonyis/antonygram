import { NextResponse } from 'next/server';

export function middleware(request) {
    const link = request.nextUrl;

    if (link.pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url), 307);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/',
};
