import { useState, useEffect, useCallback } from 'react';
import { supabase, SUPABASE_RUNTIME_INFO } from '@/integrations/supabase/client';

export interface AuthUser {
    id: string;
    email: string;
    name?: string;
    role: 'admin' | 'staff' | 'organizer';
    provider: 'supabase' | 'corporate';
}

const LOCAL_AUTH_KEY = 'ascend_auth_session_v1';

// Strict authorized email access
const AUTHORIZED_ACCESS_CONFIG = {
    allowedEmail: 'events@aionioncap.com',
    allowedPassword: 'Ascend@2026',
    name: 'Aionion Event Management Team',
    role: 'admin' as const,
};

export function useAscendAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check existing session on mount
    useEffect(() => {
        const checkAuth = async () => {
            setIsLoading(true);
            try {
                // 1. Check local session
                const localSession = localStorage.getItem(LOCAL_AUTH_KEY);
                if (localSession) {
                    const parsed = JSON.parse(localSession);
                    if (parsed && parsed.email) {
                        setUser(parsed);
                        setIsLoading(false);
                        return;
                    }
                }

                // 2. Check Supabase session if configured
                if (SUPABASE_RUNTIME_INFO.isConfigured) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (session?.user?.email) {
                        const supaUser: AuthUser = {
                            id: session.user.id,
                            email: session.user.email,
                            name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                            role: 'admin',
                            provider: 'supabase',
                        };
                        setUser(supaUser);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error('Auth verification error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Listen for Supabase auth state changes
        if (SUPABASE_RUNTIME_INFO.isConfigured) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
                if (session?.user?.email) {
                    setUser({
                        id: session.user.id,
                        email: session.user.email,
                        name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                        role: 'admin',
                        provider: 'supabase',
                    });
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        }
    }, []);

    // Login verification
    const login = useCallback(async (emailInput: string, passwordInput: string): Promise<{ success: boolean; message: string }> => {
        const cleanEmail = emailInput.trim().toLowerCase();
        const cleanPass = passwordInput.trim();

        if (!cleanEmail || !cleanPass) {
            return { success: false, message: 'Please enter both email ID and password.' };
        }

        // 1. First try Supabase Authentication if project is live
        if (SUPABASE_RUNTIME_INFO.isConfigured) {
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: cleanEmail,
                    password: cleanPass,
                });

                if (!error && data.user && data.user.email) {
                    const authUser: AuthUser = {
                        id: data.user.id,
                        email: data.user.email,
                        name: data.user.user_metadata?.full_name || data.user.email.split('@')[0],
                        role: 'admin',
                        provider: 'supabase',
                    };
                    setUser(authUser);
                    localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
                    return { success: true, message: `Welcome back, ${authUser.name || authUser.email}!` };
                }
            } catch (supaErr) {
                console.warn('Supabase auth attempt:', supaErr);
            }
        }

        // 2. Strict verification against authorized email & password
        if (
            cleanEmail === AUTHORIZED_ACCESS_CONFIG.allowedEmail.toLowerCase() &&
            cleanPass === AUTHORIZED_ACCESS_CONFIG.allowedPassword
        ) {
            const authUser: AuthUser = {
                id: `corp-${Date.now()}`,
                email: AUTHORIZED_ACCESS_CONFIG.allowedEmail,
                name: AUTHORIZED_ACCESS_CONFIG.name,
                role: AUTHORIZED_ACCESS_CONFIG.role,
                provider: 'corporate',
            };
            setUser(authUser);
            localStorage.setItem(LOCAL_AUTH_KEY, JSON.stringify(authUser));
            return { success: true, message: `Welcome back, ${AUTHORIZED_ACCESS_CONFIG.name}!` };
        }

        return {
            success: false,
            message: 'Invalid email ID or password. Access is strictly restricted to authorized administrators.',
        };
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            if (SUPABASE_RUNTIME_INFO.isConfigured) {
                await supabase.auth.signOut();
            }
        } catch (e) {
            console.error('Supabase sign out error:', e);
        }
        localStorage.removeItem(LOCAL_AUTH_KEY);
        setUser(null);
    }, []);

    return {
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
    };
}
