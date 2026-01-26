'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { API_BASE_URL } from '../app/config';

// mapping of paths to allowed roles
const PATH_PERMISSIONS: Record<string, string[]> = {
    // manager only paths
    '/Manager': ['admin'],
    '/AddUserPage': ['admin'],
    '/WeeklyShiftsPage': ['admin'],
    '/export-users': ['admin'],
    '/export-shifts': ['admin'],
    '/AddShiftPage': ['admin'],
    '/EditShiftPage': ['admin'],
    '/UserManagement': ['admin'],
    '/DeleteUserPage': ['admin'],
    '/EditUserPage': ['admin'],
    '/DeleteShiftPage': ['admin'],

    // employee only paths
    '/Browser': ['employee'], 
    '/InStoreDuty': ['employee'],
    '/OutStoreDuty': ['employee'],
    '/EndShiftInside': ['employee'],
    '/EndShiftOutside': ['employee'],
    '/EmployeeShifts': ['employee'],
};

// public paths (no authentication required)
const PUBLIC_PATHS = ['/'];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // if the path is public, no need to check auth
            if (PUBLIC_PATHS.includes(pathname)) {
                setIsAuthorized(true);
                setIsLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/validate-session`, {
                    credentials: 'include',
                    cache: 'no-store'
                });

                if (res.ok) {
                    const data = await res.json();
                    const userRole = data.role;

                    // check if the current path has role restrictions
                    const allowedRoles = PATH_PERMISSIONS[pathname];

                    if (allowedRoles) {
                        // if user's role is not in the allowed roles for this path
                        if (!allowedRoles.includes(userRole)) {
                            console.warn(`User role ${userRole} is not allowed on ${pathname}`);
                            router.push('/');
                            setIsAuthorized(false);
                            return;
                        }
                    }

                    // the user is authorized
                    setIsAuthorized(true);
                } else {
                    // invalid session
                    setIsAuthorized(false);
                    router.push('/');
                }
            } catch (error) {
                console.error("Auth check failed", error);
                router.push('/');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [pathname, router]);

    if (isLoading) {
        return null;
    }

    if (!isAuthorized && !PUBLIC_PATHS.includes(pathname)) {
        return null;
    }

    return <>{children}</>;
}