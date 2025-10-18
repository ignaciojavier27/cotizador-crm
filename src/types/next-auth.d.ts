import { UserRole } from "@prisma/client";
import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface User {
        id: string;
        email: string;
        role: UserRole
        companyId: string;
        firstName?: string;
        lastName?: string;
    }

    interface Session {
        user: {
            id: string;
            email: string;
            role: UserRole
            companyId: string;
            firstName?: string | null;
            lastName?: string | null;
        }
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        email: string;
        role: UserRole
        companyId: string;
    }
}