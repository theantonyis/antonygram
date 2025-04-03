import { NextResponse } from "next/server";

export function middleware(request) {
    const url = request.nextUrl;
    console.log("Middleware is running for:", url.pathname);

    // Redirect "/" to "/chat"
    if (url.pathname === "/") {
        return NextResponse.redirect(new URL("/chat", request.url), 307);
    }

    return NextResponse.next();
}

export const config = {
    matcher: "/", // Ensures middleware runs only on "/"
};
