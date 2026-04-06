import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import {useAuth} from "../auth/AuthProvider";

export default function LoginPage() {
    const { refresh } = useAuth();
    const nav = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await login({ email, password }); // res = { token, user }
            localStorage.setItem("token", res.token);

            const backTo = location.state?.from || "/";

            await refresh();

            nav(backTo);
        } catch (err) {
            setError(err?.message || "Ошибка входа");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-6">
                <h1 className="text-xl font-semibold text-slate-900">Вход</h1>
                <p className="mt-1 text-sm text-slate-600">Войдите в аккаунт.</p>

                {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                        {error}
                    </div>
                )}

                <form className="mt-5 space-y-3" onSubmit={submit}>
                    <Field label="Email" value={email} onChange={setEmail} type="email" placeholder="mail@example.com" />
                    <Field label="Пароль" value={password} onChange={setPassword} type="password" placeholder="••••••••" />

                    <button
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    >
                        {loading ? "Входим..." : "Войти"}
                    </button>

                    <div className="text-sm text-slate-600 text-center">
                        Нет аккаунта?{" "}
                        <Link to="/register" className="font-medium text-slate-900 hover:underline">
                            Регистрация
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, type = "text", placeholder }) {
    return (
        <div>
            <div className="text-xs font-semibold text-slate-700">{label}</div>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
        </div>
    );
}
