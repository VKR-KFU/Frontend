import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthProvider";

export default function RequireRole({ roles }) {
    const { user, loading } = useAuth();

    if (loading) return <div className="p-6 text-sm text-slate-600">Проверяем доступ…</div>;
    if (!user) return <Navigate to="/login" replace />;

    if (!roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}