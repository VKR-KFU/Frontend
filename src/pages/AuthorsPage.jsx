import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, Users, Building2, X } from "lucide-react";

// ---- Mocks ----
const MOCK_AUTHORS = [
    {
        id: "a1",
        fullName: "Иванов Иван Иванович",
        organization: "Казанский (Приволжский) федеральный университет",
        department: "Институт вычислительной математики и ИТ",
        publications: 42,
        citations: 318,
    },
    {
        id: "a2",
        fullName: "Петрова Анна Сергеевна",
        organization: "МГТУ им. Н.Э. Баумана",
        department: "Кафедра информатики",
        publications: 18,
        citations: 97,
    },
    {
        id: "a3",
        fullName: "Сидоров Дмитрий Павлович",
        organization: "СПбГУ",
        department: "Факультет математики и механики",
        publications: 9,
        citations: 21,
    },
    {
        id: "a4",
        fullName: "X.Д.Дмитрий", // мусорный
        organization: null,
        department: null,
        publications: 3,
        citations: 0,
    },
    {
        id: "a5",
        fullName: "А.Б.В.", // мусорный
        organization: "—",
        department: "—",
        publications: 1,
        citations: 0,
    },
    {
        id: "a6",
        fullName: "Кузнецов Андрей Михайлович",
        organization: "НИУ ВШЭ",
        department: "Школа анализа данных",
        publications: 27,
        citations: 144,
    },
];

// ---- Utils ----
function isGarbageAuthorName(name) {
    if (!name) return true;
    const s = name.trim();
    if (s.length < 6) return true;
    const dotCount = (s.match(/\./g) || []).length;
    if (dotCount >= 3) return true;
    if (/^[A-Za-zА-Яа-я]\.[A-Za-zА-Яа-я]\..+/.test(s)) return true; // X.Д.Дмитрий
    if (/([A-Za-zА-Яа-я]\.){2,}/.test(s)) return true; // А.Б.В.
    return false;
}

function initials(name) {
    const parts = (name || "").split(" ").filter(Boolean);
    if (!parts.length) return "AU";
    const first = parts[0][0] || "";
    const last = parts[parts.length - 1][0] || "";
    const res = (first + last).toUpperCase();
    return res || "AU";
}

function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
}

export default function AuthorsPage() {
    const [query, setQuery] = useState("");
    const [onlyValid, setOnlyValid] = useState(true);
    const [page, setPage] = useState(1);
    const pageSize = 8;

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        return MOCK_AUTHORS.filter((a) => {
            if (onlyValid && isGarbageAuthorName(a.fullName)) return false;

            if (!q) return true;

            const hay = [
                a.fullName,
                a.organization || "",
                a.department || "",
            ]
                .join(" ")
                .toLowerCase();

            return hay.includes(q);
        });
    }, [query, onlyValid]);

    const sorted = useMemo(() => {
        // Можно поменять сортировку: по цитированиям/публикациям
        return [...filtered].sort(
            (a, b) => (b.citations || 0) - (a.citations || 0) || (b.publications || 0) - (a.publications || 0)
        );
    }, [filtered]);

    const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
    const safePage = clamp(page, 1, totalPages);

    const items = useMemo(() => {
        const start = (safePage - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, safePage]);

    // если фильтр изменился и текущая страница стала невалидной
    React.useEffect(() => {
        setPage(1);
    }, [query, onlyValid]);

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
                                Поиск по ФИО, организации и кафедре. Мусорные имена скрываются по умолчанию.
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setOnlyValid((v) => !v)}
                                className={
                                    "rounded-xl px-4 py-2 text-sm font-medium " +
                                    (onlyValid
                                        ? "bg-white text-slate-900 hover:bg-white/90"
                                        : "bg-white/10 text-white ring-1 ring-white/20 hover:bg-white/15")
                                }
                            >
                                {onlyValid ? "Скрывать мусорных: ВКЛ" : "Скрывать мусорных: ВЫКЛ"}
                            </button>
                            <button
                                onClick={() => {
                                    setQuery("");
                                    setOnlyValid(true);
                                }}
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
                                placeholder="Поиск: Иванов, КФУ, кафедра..."
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
                                Найдено: <span className="font-semibold text-white">{sorted.length}</span>
                            </div>
                            <div className="hidden sm:block">
                                Сортировка: цитирования ↓, публикации ↓
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-6xl px-4 py-10">
                {sorted.length === 0 ? (
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-10 text-center">
                        <div className="mx-auto max-w-md space-y-2">
                            <div className="text-lg font-semibold text-slate-900">Ничего не найдено</div>
                            <div className="text-sm text-slate-600">
                                Попробуйте изменить запрос или отключить фильтр мусорных имён.
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {items.map((a) => (
                                <AuthorCard key={a.id} author={a} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between">
                                <button
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                                    disabled={safePage <= 1}
                                    onClick={() => setPage((v) => Math.max(1, v - 1))}
                                >
                                    Назад
                                </button>

                                <div className="text-sm text-slate-600">
                                    Страница <span className="font-semibold text-slate-900">{safePage}</span> из{" "}
                                    <span className="font-semibold text-slate-900">{totalPages}</span>
                                </div>

                                <button
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                                    disabled={safePage >= totalPages}
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
    const garbage = isGarbageAuthorName(author.fullName);

    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-5">
            <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 ring-1 ring-black/5 grid place-items-center font-semibold text-slate-700">
                    {initials(author.fullName)}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <div className="truncate text-base font-semibold text-slate-900">
                            {author.fullName}
                        </div>
                        {garbage && (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                мусор
              </span>
                        )}
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

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Pill outline>Публикации: {author.publications ?? 0}</Pill>
                        <Pill outline>Цитирования: {author.citations ?? 0}</Pill>
                    </div>

                    <div className="mt-4 flex justify-end">
                        {garbage ? (
                            <button
                                disabled
                                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
                                title="Похоже на некорректно распознанное имя — профиль недоступен"
                            >
                                Профиль недоступен
                            </button>
                        ) : (
                            <Link
                                to={`/authors/${author.id}`}
                                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                Открыть профиль
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Pill({ children, outline }) {
    return (
        <span
            className={
                "rounded-full px-3 py-1 text-xs font-medium " +
                (outline
                    ? "border border-slate-200 bg-white text-slate-700"
                    : "bg-slate-100 text-slate-700")
            }
        >
      {children}
    </span>
    );
}
