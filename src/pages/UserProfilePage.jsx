import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, ShieldCheck, User as UserIcon, LogOut } from "lucide-react";
import getMe from "../api/userApi";

export default function UserProfilePage() {
    const nav = useNavigate();

    const token = localStorage.getItem("token");

    const [me, setMe] = useState(null); // { role, fullName, email, authorId }
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const data = await getMe();
                if (!cancelled) setMe(data);
            } catch {
                if (!cancelled) setMe(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        // если токена нет — смысла дергать /me нет
        if (!token) {
            setMe(null);
            setLoading(false);
            return;
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [token]);

    const logout = () => {
        localStorage.removeItem("token");
        setMe(null);
        nav("/");
        window.location.reload(); // можешь убрать позже, если сделаешь AuthContext
    };

    const isAuthor = useMemo(() => me?.role === "Author", [me]);
    const displayName = useMemo(() => me?.fullName || me?.email || "—", [me]);

    // Если нет токена — заглушка
    if (!token) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6">
                    <div className="text-lg font-semibold text-slate-900">Профиль</div>
                    <div className="mt-2 text-sm text-slate-600">Вы не вошли в систему.</div>
                    <div className="mt-4">
                        <Link
                            to="/login"
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                        >
                            Войти
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Пока грузим /me
    if (loading) {
        return (
            <div className="mx-auto max-w-5xl px-4 py-10">
                <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6 text-sm text-slate-600">
                    Загрузка профиля…
                </div>
            </div>
        );
    }

    // Если токен есть, но /me вернул null (например 401) — считаем что сессия протухла
    if (!me) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-10">
                <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6">
                    <div className="text-lg font-semibold text-slate-900">Профиль</div>
                    <div className="mt-2 text-sm text-slate-600">
                        Сессия истекла или вы не авторизованы. Войдите снова.
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Link
                            to="/login"
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Войти
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem("token");
                                nav("/");
                                window.location.reload();
                            }}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                        >
                            На главную
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
            {/* Account header */}
            <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-slate-100 grid place-items-center">
                        <UserIcon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-lg font-semibold text-slate-900 truncate">
                            {displayName}
                        </div>
                        <div className="text-sm text-slate-600">
                            {me.email}
                            <span className="mx-2">•</span>
                            Статус:{" "}
                            <span
                                className={
                                    "font-semibold " +
                                    (isAuthor ? "text-emerald-700" : "text-slate-800")
                                }
                            >
                {isAuthor ? "Автор (подтвержден)" : "Пользователь"}
              </span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                    <LogOut className="h-4 w-4" />
                    Выйти
                </button>
            </div>

            {/* Author profile block */}
            {isAuthor ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 rounded-2xl bg-white ring-1 ring-black/5 p-6">
                        <div className="flex items-center gap-2 text-slate-900 font-semibold">
                            <ShieldCheck className="h-5 w-5" />
                            Мой авторский профиль
                        </div>

                        <div className="mt-2 text-sm text-slate-600">
                            Ваш аккаунт привязан к профилю автора. Доступна панель автора и действия по публикациям.
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                to={me.authorId ? `/author/${me.authorId}` : "/authors"}
                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                Открыть профиль автора
                            </Link>

                            <Link
                                to={me.authorId ? `/author/${me.authorId}` : "/authors"}
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                                Мои публикации
                            </Link>
                        </div>

                        {!me.authorId && (
                            <div className="mt-3 text-xs text-amber-700">
                                У аккаунта нет AuthorId. Значит подтверждение ещё не завершено или связь не сохранена на бэке.
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-5 rounded-2xl bg-white ring-1 ring-black/5 p-6">
                        <div className="text-slate-900 font-semibold">Инструменты автора</div>

                        <div className="mt-3 space-y-2">
                            <ActionLink
                                to={me.authorId ? `/author/${me.authorId}` : "/authors"}
                                icon={<BookOpen className="h-4 w-4" />}
                            >
                                Публикации и статистика
                            </ActionLink>

                            <ActionLink to="#" disabled>
                                Загрузить PDF (позже)
                            </ActionLink>
                            <ActionLink to="#" disabled>
                                Запросить исправление данных (позже)
                            </ActionLink>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-7 rounded-2xl bg-white ring-1 ring-black/5 p-6">
                        <div className="text-slate-900 font-semibold">Возможности пользователя</div>
                        <div className="mt-2 text-sm text-slate-600">
                            Вы можете читать статьи, подписываться на авторов и сохранять публикации.
                            Если у вас есть профиль автора — отправьте заявку на подтверждение.
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link
                                to="/authors"
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                                Найти себя среди авторов
                            </Link>

                            <Link
                                to="/authors"
                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                Стать автором
                            </Link>
                        </div>
                    </div>

                    <div className="lg:col-span-5 rounded-2xl bg-white ring-1 ring-black/5 p-6">
                        <div className="text-slate-900 font-semibold">Подписки</div>
                        <div className="mt-2 text-sm text-slate-600">
                            (Можно добавить список авторов, на которых подписан пользователь.)
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ActionLink({ to, children, icon, disabled }) {
    if (disabled) {
        return (
            <div className="rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-400">
                {children}
            </div>
        );
    }

    return (
        <Link
            to={to}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
        >
            {icon}
            {children}
        </Link>
    );
}
