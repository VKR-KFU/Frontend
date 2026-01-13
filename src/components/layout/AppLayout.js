import React from "react";
import { Link, NavLink } from "react-router-dom";

function navClass({ isActive }) {
    return (
        "rounded-xl px-3 py-2 text-sm font-medium transition " +
        (isActive
            ? "bg-white/15 text-white ring-1 ring-white/20"
            : "text-white/80 hover:bg-white/10 hover:text-white")
    );
}

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-white/10">
                <div className="mx-auto max-w-6xl px-4">
                    <div className="h-14 flex items-center justify-between gap-3">
                        <Link
                            to="/"
                            className="text-white font-semibold tracking-tight hover:text-white/90"
                        >
                            VKR Articles
                        </Link>

                        <nav className="flex items-center gap-2">
                            <NavLink to="/" className={navClass} end>
                                Статьи
                            </NavLink>
                            <NavLink to="/authors" className={navClass}>
                                Авторы
                            </NavLink>
                        </nav>
                    </div>
                </div>
            </header>

            <main>{children}</main>
        </div>
    );
}
