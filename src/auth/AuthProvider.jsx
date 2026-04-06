import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import getMe from "../api/userApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            setUser(null);
            setLoading(false);
            return null;
        }

        setLoading(true);
        try {
            const me = await getMe();
            setUser(me);
            console.log(me);
            return me;
        } catch {
            setUser(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        setUser(null);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const value = useMemo(
        () => ({
            user,
            loading,
            refresh,
            logout,
            isAuthenticated: !!user,
            hasRole: (roles) => !!user?.role && roles.includes(user.role),
        }),
        [user, loading, refresh, logout]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
