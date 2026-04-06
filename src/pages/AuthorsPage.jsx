import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Users, Building2, X } from "lucide-react";
import { getAuthors } from "../api/authorApi";

function initials(name) {
    const parts = (name || "").split(" ").filter(Boolean);
    if (!parts.length) return "AU";
    const first = parts[0][0] || "";
    const last = parts[parts.length - 1][0] || "";
    const res = (first + last).toUpperCase();
    return res || "AU";
}

export default function AuthorsPage() {
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const [items, setItems] = useState([]);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    // загрузка
    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await getAuthors({ query, page, pageSize });
                if (cancelled) return;

                setItems(Array.isArray(data.items) ? data.items : []);
                setTotal(Number(data.total ?? 0));
            } catch (e) {
                if (!cancelled) setError(e.message || "Ошибка при загрузке авторов");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [query, page]);

    // при изменении query — всегда на 1 страницу
    useEffect(() => {
        setPage(1);
    }, [query]);

    const foundCountText = useMemo(() => {
        if (loading) return "…";
        return String(total);
    }, [loading, total]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-700">
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="text-white">
                            <div className="inline-flex items-center gap-2 text-sm text-white/80">
                                <Users className="h-4 w-4" />
                                Авторы
                            </div>
                            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                                Каталог авторов
                            </h1>
                            <div className="mt-1 text-sm text-white/80">
                                Поиск по ФИО и организации.
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setQuery("")}
                                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/15"
                            >
                                Сброс
                            </button>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="mt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Поиск: Иванов, КФУ..."
                                className="w-full rounded-2xl bg-white/10 px-9 py-3 text-sm text-white placeholder:text-white/60 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-white/30"
                            />
                            {query && (
                                <button
                                    onClick={() => setQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/70 hover:bg-white/10"
                                    aria-label="Очистить поиск"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm text-white/80">
                            <div className="inline-flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Найдено: <span className="font-semibold text-white">{foundCountText}</span>
                            </div>
                            <div className="hidden sm:block">
                                Страница {page} из {totalPages}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-6xl px-4 py-10">
                {loading && (
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-8 text-center text-slate-600">
                        Загрузка…
                    </div>
                )}

                {error && !loading && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
                        {error}
                    </div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-10 text-center">
                        <div className="mx-auto max-w-md space-y-2">
                            <div className="text-lg font-semibold text-slate-900">
                                Ничего не найдено
                            </div>
                            <div className="text-sm text-slate-600">
                                Попробуйте изменить запрос.
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((a) => (
                                <AuthorCard key={a.id} author={a} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <button
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                                    disabled={page <= 1}
                                    onClick={() => setPage((v) => Math.max(1, v - 1))}
                                >
                                    Назад
                                </button>

                                <div className="text-sm text-slate-600">
                                    Страница{" "}
                                    <span className="font-semibold text-slate-900">{page}</span>{" "}
                                    из{" "}
                                    <span className="font-semibold text-slate-900">{totalPages}</span>
                                </div>

                                <button
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                                >
                                    Вперёд
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function AuthorCard({ author }) {
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center font-semibold text-slate-700">
                    {initials(author.fullName)}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-slate-900">
                        {author.fullName}
                    </div>

                    <div className="mt-1 space-y-1 text-sm text-slate-600">
                        <div className="inline-flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-slate-500" />
                            <span className="truncate">{author.organization || "—"}</span>
                        </div>
                        {author.department ? (
                            <div className="truncate">{author.department}</div>
                        ) : null}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <Link
                            to={`/author/${author.id}`}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                        >
                            Открыть профиль
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
