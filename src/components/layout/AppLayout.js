import React, { useMemo } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";

const navClass = ({ isActive }) =>
    "rounded-xl px-3 py-2 text-sm font-medium " +
    (isActive ? "bg-white/10 text-white" : "text-white/80 hover:text-white hover:bg-white/5");

export default function AppLayout({ hideHeader = false }) {
    const navigate = useNavigate();

    const { user, logout } = useAuth();
    const isAuthed = !!user;

    const onLogout = () => {
        logout();
        navigate("/");
    };

    const isAdmin = useMemo(() => user?.role === "Admin", [user]);

    return (
        <div className="min-h-screen bg-slate-50">
            {!hideHeader && (
                <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-white/10">
                    <div className="mx-auto max-w-6xl px-4">
                        <div className="h-14 flex items-center justify-between gap-3">
                            <Link to="/" className="text-white font-semibold tracking-tight hover:text-white/90">
                                VKR Articles
                            </Link>

                            <div className="flex items-center gap-3">
                                <nav className="flex items-center gap-2">
                                    <NavLink to="/" className={navClass} end>
                                        Статьи
                                    </NavLink>
                                    <NavLink to="/authors" className={navClass}>
                                        Авторы
                                    </NavLink>

                                    {isAdmin && (
                                        <NavLink to="/admin/claims" className={navClass}>
                                            Админка
                                        </NavLink>
                                    )}
                                </nav>

                                {/* Auth actions */}
                                <div className="flex items-center gap-2">
                                    {!isAuthed ? (
                                        <>
                                            <Link
                                                to="/login"
                                                className="rounded-xl px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/5"
                                            >
                                                Войти
                                            </Link>
                                            <Link
                                                to="/register"
                                                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
                                            >
                                                Регистрация
                                            </Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link
                                                to="/me"
                                                className="rounded-xl px-3 py-2 text-sm font-medium text-white/90 hover:text-white hover:bg-white/5"
                                            >
                                                Профиль
                                            </Link>
                                            <button
                                                onClick={onLogout}
                                                className="rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/15"
                                            >
                                                Выйти
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            <main>
                <Outlet />
            </main>
        </div>
    );
}
