import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    pages: {
        signIn: "/login",
        signOut: "/login",
        error: "/login",
    },
    callbacks: {
        authorized({ auth, request: {nextUrl} }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAuth = nextUrl.pathname.startsWith('/login') ||
                             nextUrl.pathname.startsWith('/register');

            if(isOnDashboard) {
                if(isLoggedIn) return true;
                return false;
            } else if(isOnAuth) {
                if(isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
                return true;
            }
            return true;
        },
        jwt({ token, user }){
            if(user){
                token.id = user.id;
                token.email = user.email;
                token.role = user.role;
                token.companyId = user.companyId;
                token.firstName = user.firstName;
                token.lastName = user.lastName;
            }
            return token;
        },
        session({ session, token }){
            if(token) {
                session.user.id = token.id;
                session.user.email = token.email!;
                session.user.role = token.role;
                session.user.companyId = token.companyId;
                session.user.firstName = token.firstName;
                session.user.lastName = token.lastName;
            }
            return session;
        },
    },
    providers: [],
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60, // 30 days
    }, 
    secret: process.env.NEXTAUTH_SECRET,
}
