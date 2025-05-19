import { NextResponse } from 'next/server';

export function middleware(request) {
    const url = request.nextUrl;
    console.log("Middleware is running for:", url.pathname);

    // Redirect "/" to "/login"
    if (url.pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url), 307);
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/', // this middleware only runs for route "/"
};
