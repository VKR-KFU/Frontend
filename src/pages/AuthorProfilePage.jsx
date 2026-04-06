import React, { useEffect, useMemo, useState } from "react";
import {
    BookOpen,
    Download,
    ExternalLink,
    Filter,
    MapPin,
    Search,
    ShieldCheck,
    Star,
    User,
    Users,
    X,
} from "lucide-react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import { getAuthor, getAuthorPublications } from "../api/authorApi";
import {sendVerifyClaimAuthor} from "../api/authorVerify";

async function submitClaim(authorId, payload) {
    await sendVerifyClaimAuthor(payload);
    return { ok: true };
}

function initials(name) {
    const parts = (name || "").split(" ").filter(Boolean);
    if (!parts.length) return "";
    const first = parts[0][0] || "";
    const last = parts[parts.length - 1][0] || "";
    return (first + last).toUpperCase();
}

function formatAuthors(authors, limit = 3) {
    if (!authors?.length) return "";
    const head = authors.slice(0, limit).join(", ");
    const rest = authors.length - limit;
    return rest > 0 ? `${head} и ещё ${rest}` : head;
}

function mapPublication(p) {
    const citations = (p.citationsRinc || 0) + (p.citationsCoreRinc || 0);

    return {
        id: p.articleProviderId || p.id,
        year: p.year ?? null,
        title: p.title || "",
        articleProviderId: p.articleProviderId || "",
        venue: p.sourceName || "Источник",
        type: p.publicationType || "Публикация",
        citations,
        authors: p.authors || [],
        keywords: p.keywords || [],
        abstract: p.abstract || "",
        sourceUrl: p.sourceUrl || null,
        pdfUrl: p.pdfUrl || null,
        views: p.views || 0,
        downloads: p.downloads || 0,
    };
}

export default function AuthorProfilePage() {
    const { id } = useParams(); // GUID автора
    const navigate = useNavigate();
    const routerLocation = useLocation();

    const [tab, setTab] = useState("pubs");

    // --- Modal: open/close with animation ---
    // claimMounted = модалка в DOM, claimOpen = фаза "показать" (для transition)
    const [claimMounted, setClaimMounted] = useState(false);
    const [claimOpen, setClaimOpen] = useState(false);

    const [author, setAuthor] = useState(null);
    const [pubsRaw, setPubsRaw] = useState([]);
    const [total, setTotal] = useState(0);

    const [loadingAuthor, setLoadingAuthor] = useState(true);
    const [loadingPubs, setLoadingPubs] = useState(true);
    const [error, setError] = useState("");

    const [query, setQuery] = useState("");
    const [yearFrom, setYearFrom] = useState("");
    const [yearTo, setYearTo] = useState("");
    const [onlyPdf, setOnlyPdf] = useState(false);

    const [page, setPage] = useState(1);
    const pageSize = 20;

    // --- Claim form state ---
    const [claim, setClaim] = useState({
        ContactEmail: "",
        ContactPhone: "",
        EvidenceLink: "",
        Comment: "",
    });
    const [claimErrors, setClaimErrors] = useState({});
    const [claimSubmitting, setClaimSubmitting] = useState(false);
    const [claimSuccess, setClaimSuccess] = useState(false);

    const setClaimField = (key) => (e) => {
        setClaimSuccess(false);
        setClaimErrors((prev) => ({ ...prev, [key]: "" }));
        setClaim((prev) => ({ ...prev, [key]: e.target.value }));
    };

    const validateClaim = () => {
        const errs = {};
        const email = claim.ContactEmail.trim();
        const phone = claim.ContactPhone.trim();
        const link = claim.EvidenceLink.trim();

        // хотя бы один контакт
        if (!email && !phone) {
            errs.ContactEmail = "Укажите email или телефон для связи";
            errs.ContactPhone = "Укажите email или телефон для связи";
        }

        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
            errs.ContactEmail = "Похоже, email указан некорректно";
        }

        if (link) {
            try {
                new URL(link);
            } catch {
                errs.EvidenceLink = "Ссылка должна быть корректным URL (например https://...)";
            }
        }

        setClaimErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const resetClaimForm = () => {
        setClaim({
            ContactEmail: "",
            ContactPhone: "",
            EvidenceLink: "",
            Comment: "",
        });
        setClaimErrors({});
        setClaimSubmitting(false);
        setClaimSuccess(false);
    };

    const openClaim = () => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", { state: { from: routerLocation.pathname } });
            return;
        }

        setClaimMounted(true);
        requestAnimationFrame(() => setClaimOpen(true));
    };

    const closeClaim = () => {
        setClaimOpen(false);
        // duration должен совпадать с duration-xxx на модалке/оверлее
        window.setTimeout(() => {
            setClaimMounted(false);
            resetClaimForm();
        }, 220);
    };

    const onSubmitClaim = async () => {
        if (!id) return;
        if (!validateClaim()) return;

        setClaimSubmitting(true);
        setError("");

        try {
            const payload = {
                ContactEmail: claim.ContactEmail.trim(),
                ContactPhone: claim.ContactPhone.trim(),
                EvidenceLink: claim.EvidenceLink.trim(),
                Comment: claim.Comment.trim(),
                AuthorId: id
            };

            const res = await submitClaim(id, payload);

            if (res?.ok === false) {
                throw new Error(res?.message || "Не удалось отправить заявку");
            }

            setClaimSuccess(true);
        } catch (e) {
            setError(e?.message || "Не удалось отправить заявку");
        } finally {
            setClaimSubmitting(false);
        }
    };

    // ESC to close modal (плавно)
    useEffect(() => {
        if (!claimMounted) return;

        const onKeyDown = (e) => {
            if (e.key === "Escape") closeClaim();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claimMounted]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        async function loadAuthor() {
            setLoadingAuthor(true);
            setError("");
            try {
                const a = await getAuthor(id);
                if (!cancelled) setAuthor(a);
            } catch (e) {
                if (!cancelled) setError(e?.message || "Не удалось загрузить автора");
            } finally {
                if (!cancelled) setLoadingAuthor(false);
            }
        }

        loadAuthor();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // при смене фильтров — на первую страницу
    useEffect(() => {
        setPage(1);
    }, [id, query, yearFrom, yearTo, onlyPdf]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        async function loadPubs() {
            setLoadingPubs(true);
            setError("");
            try {
                const p = await getAuthorPublications(id, {
                    q: query || "",
                    yearFrom: yearFrom || "",
                    yearTo: yearTo || "",
                    onlyPdf: onlyPdf ? "true" : "",
                    page: String(page),
                    pageSize: String(pageSize),
                });

                if (cancelled) return;
                setPubsRaw(p.items || []);
                setTotal(p.total || 0);
            } catch (e) {
                if (!cancelled) setError(e?.message || "Не удалось загрузить публикации");
            } finally {
                if (!cancelled) setLoadingPubs(false);
            }
        }

        loadPubs();
        return () => {
            cancelled = true;
        };
    }, [id, query, yearFrom, yearTo, onlyPdf, page]);

    const pubs = useMemo(() => pubsRaw.map(mapPublication), [pubsRaw]);

    const sorted = useMemo(() => {
        // если бэк уже сортирует — можешь убрать
        return [...pubs].sort(
            (a, b) =>
                (b.year || 0) - (a.year || 0) || (b.citations || 0) - (a.citations || 0)
        );
    }, [pubs]);

    const stats = useMemo(() => {
        const s = author?.stats;
        return {
            publications: s?.publications ?? total ?? 0,
            citations: (s?.totalCitationsRinc ?? 0) + (s?.totalCitationsCoreRinc ?? 0),
            views: s?.totalViews ?? 0,
            downloads: s?.totalDownloads ?? 0,
        };
    }, [author, total]);

    const topCoauthors = useMemo(() => {
        // 1) если пришли с бэка — используем их
        if (author?.topCoauthors?.length) {
            return author.topCoauthors.map((c) => ({
                id: c.id,
                fullName: c.fullName,
            }));
        }

        // 2) fallback по pubs (id нет — ставим null)
        const counts = new Map();
        for (const p of pubs || []) {
            for (const a of p.authors || []) {
                if (!a?.fullName) continue;

                // исключаем самого автора
                if (author?.id && a.id === author.id) continue;
                if (!author?.id && author?.fullName && a.fullName === author.fullName) continue;

                const key = a.id || a.fullName; // если id нет — ключом имя
                const prev = counts.get(key) || { id: a.id ?? null, fullName: a.fullName, n: 0 };
                prev.n += 1;
                counts.set(key, prev);
            }
        }

        return [...counts.values()]
            .sort((x, y) => y.n - x.n)
            .slice(0, 8)
            .map(({ id, fullName }) => ({ id, fullName }));
    }, [author, pubs]);

    function handleClickArticleTitle(articleProviderId) {
        navigate(`/article/${articleProviderId}`);
    }

    const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="relative">
                <div className="h-44 sm:h-56 bg-gradient-to-r from-slate-900 to-slate-700" />
                <div className="absolute inset-x-0 bottom-0 translate-y-1/2">
                    <div className="mx-auto max-w-6xl px-4">
                        <div className="rounded-2xl bg-white shadow-lg ring-1 ring-black/5">
                            <div className="p-5 sm:p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-2xl bg-white ring-1 ring-black/10">
                                                <div className="grid h-full w-full place-items-center text-lg font-semibold">
                                                    {initials(author?.fullName || "")}
                                                </div>
                                            </div>
                                            {author?.verified && (
                                                <div className="absolute -right-2 -bottom-2 rounded-full bg-white p-1 ring-1 ring-black/10">
                                                    <ShieldCheck className="h-5 w-5" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h1 className="text-xl sm:text-2xl font-semibold tracking-tight truncate">
                                                    {loadingAuthor ? "Загрузка..." : author?.fullName || "Автор не найден"}
                                                </h1>

                                                {(author?.department || author?.organization) && (
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {author.department || author.organization}
                          </span>
                                                )}

                                                {author?.spinCode && (
                                                    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700">
                            SPIN: {author.spinCode}
                          </span>
                                                )}
                                            </div>

                                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                            {author?.organization || "—"}
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 sm:items-end">
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto">
                                            <Stat label="Публикации" value={stats.publications} Icon={BookOpen} />
                                            <Stat label="Цитирования" value={stats.citations} Icon={Star} />
                                            <Stat label="Просмотры" value={stats.views} Icon={User} />
                                            <Stat label="Загрузки" value={stats.downloads} Icon={Users} />
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                                            <button className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200">
                                                Подписаться
                                            </button>

                                            {author?.isVerified ? (
                                                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-200">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    Автор подтверждён
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={openClaim}
                                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                                                >
                                                    Это вы?
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div className="mx-auto max-w-6xl px-4 pt-24 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card title="О авторе">
                            <div className="space-y-2 text-sm text-slate-700">
                                <div>
                                    <span className="text-slate-500">Организация: </span>
                                    <span className="font-medium text-slate-900">{author?.organization || "—"}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500">Кафедра/отдел: </span>
                                    <span className="font-medium text-slate-900">{author?.department || "—"}</span>
                                </div>
                            </div>
                        </Card>

                        <Card title="Топ соавторы">
                            {topCoauthors.length === 0 ? (
                                <div className="text-sm text-slate-600">Нет данных</div>
                            ) : (
                                <div className="space-y-2">
                                    {topCoauthors.map((c) => (
                                        <div
                                            key={c.fullName}
                                            className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                                        >
                                            <div className="min-w-0">
                                                <div className="text-sm font-medium text-slate-900 truncate">{c.fullName}</div>
                                            </div>
                                            <button
                                                onClick={() => navigate(`/author/${c.id}`)}
                                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                                            >
                                                Профиль
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Right */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Search + filters */}
                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-4 sm:p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                        <input
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="Поиск по названию, авторам, ключевым словам…"
                                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-slate-500" />
                                        <input
                                            value={yearFrom}
                                            onChange={(e) => setYearFrom(e.target.value)}
                                            inputMode="numeric"
                                            placeholder="От"
                                            className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                                        />
                                        <input
                                            value={yearTo}
                                            onChange={(e) => setYearTo(e.target.value)}
                                            inputMode="numeric"
                                            placeholder="До"
                                            className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                                        />
                                    </div>

                                    <button
                                        onClick={() => setOnlyPdf((v) => !v)}
                                        className={
                                            "rounded-xl px-4 py-2 text-sm font-medium " +
                                            (onlyPdf
                                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                                : "border border-slate-200 text-slate-800 hover:bg-slate-50")
                                        }
                                    >
                                        Только с PDF
                                    </button>

                                    <button
                                        onClick={() => {
                                            setQuery("");
                                            setYearFrom("");
                                            setYearTo("");
                                            setOnlyPdf(false);
                                        }}
                                        className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200"
                                    >
                                        Сброс
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2">
                            <TabButton active={tab === "pubs"} onClick={() => setTab("pubs")}>
                                Публикации
                            </TabButton>
                            <TabButton active={tab === "about"} onClick={() => setTab("about")}>
                                О профиле
                            </TabButton>
                        </div>

                        {tab === "pubs" && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm text-slate-600">
                                    <div>
                                        Найдено:{" "}
                                        <span className="text-slate-900 font-semibold">{loadingPubs ? "..." : total}</span>
                                    </div>
                                    <div className="hidden sm:block">Сортировка: год ↓, цитирования ↓</div>
                                </div>

                                {loadingPubs ? (
                                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-8 text-center text-slate-600">
                                        Загрузка публикаций…
                                    </div>
                                ) : sorted.length === 0 ? (
                                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-8 text-center">
                                        <div className="mx-auto max-w-md space-y-2">
                                            <div className="text-lg font-semibold text-slate-900">Ничего не найдено</div>
                                            <div className="text-sm text-slate-600">
                                                Попробуйте изменить запрос или фильтры.
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        {sorted.map((p) => (
                                            <PublicationCard key={p.id} pub={p} handleClickArticle={handleClickArticleTitle} />
                                        ))}

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between pt-2">
                                                <button
                                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50"
                                                    disabled={page <= 1}
                                                    onClick={() => setPage((v) => Math.max(1, v - 1))}
                                                >
                                                    Назад
                                                </button>

                                                <div className="text-sm text-slate-600">
                                                    Страница <span className="font-semibold text-slate-900">{page}</span> из{" "}
                                                    <span className="font-semibold text-slate-900">{totalPages}</span>
                                                </div>

                                                <button
                                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium disabled:opacity-50"
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
                        )}

                        {tab === "about" && (
                            <Card title="Данные профиля">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <InfoRow label="ID автора" value={author?.id || id} />
                                    <InfoRow label="SPIN" value={author?.spinCode || "—"} />
                                    <InfoRow label="Организация" value={author?.organization || "—"} />
                                    <InfoRow label="Кафедра" value={author?.department || "—"} />
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal: Это вы? (с плавной анимацией) */}
            {claimMounted && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* overlay */}
                    <div
                        className={
                            "absolute inset-0 bg-black/40 transition-opacity duration-200 " +
                            (claimOpen ? "opacity-100" : "opacity-0")
                        }
                        onClick={closeClaim}
                    />

                    {/* dialog */}
                    <div
                        className={
                            "relative w-full max-w-lg rounded-2xl bg-white shadow-xl ring-1 ring-black/10 " +
                            "transform transition-all duration-200 " +
                            (claimOpen
                                ? "opacity-100 translate-y-0 scale-100"
                                : "opacity-0 translate-y-2 scale-[0.98]")
                        }
                    >
                        <div className="flex items-start justify-between p-5">
                            <div>
                                <div className="text-lg font-semibold text-slate-900">Подтверждение профиля</div>
                                <div className="mt-1 text-sm text-slate-600">
                                    Оставьте контакты и (желательно) ссылку-доказательство: ORCID / Google Scholar / сайт организации.
                                </div>
                            </div>
                            <button
                                className="rounded-xl p-2 hover:bg-slate-100"
                                onClick={closeClaim}
                                aria-label="Закрыть"
                            >
                                <X className="h-5 w-5 text-slate-700" />
                            </button>
                        </div>

                        <div className="px-5 pb-5 space-y-3">
                            {claimSuccess && (
                                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                    Заявка отправлена. Мы свяжемся с вами по указанным контактам.
                                </div>
                            )}

                            <Field
                                label="ContactEmail"
                                placeholder="ivanov@university.ru"
                                value={claim.ContactEmail}
                                onChange={setClaimField("ContactEmail")}
                                error={claimErrors.ContactEmail}
                            />
                            <Field
                                label="ContactPhone"
                                placeholder="+7 999 123-45-67"
                                value={claim.ContactPhone}
                                onChange={setClaimField("ContactPhone")}
                                error={claimErrors.ContactPhone}
                            />
                            <Field
                                label="EvidenceLink"
                                placeholder="https://orcid.org/0000-0000-0000-0000"
                                value={claim.EvidenceLink}
                                onChange={setClaimField("EvidenceLink")}
                                error={claimErrors.EvidenceLink}
                            />
                            <FieldArea
                                label="Comment"
                                placeholder="Любая дополнительная информация…"
                                value={claim.Comment}
                                onChange={setClaimField("Comment")}
                                error={claimErrors.Comment}
                            />

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                                    onClick={closeClaim}
                                    disabled={claimSubmitting}
                                >
                                    Отмена
                                </button>
                                <button
                                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                                    onClick={onSubmitClaim}
                                    disabled={claimSubmitting}
                                >
                                    {claimSubmitting ? "Отправка…" : "Начать подтверждение"}
                                </button>
                            </div>

                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Field({ label, value, onChange, placeholder, error }) {
    return (
        <div>
            <div className="text-xs font-semibold text-slate-700">{label}</div>
            <input
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={
                    "mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 " +
                    (error ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-slate-300")
                }
            />
            {error ? <div className="mt-1 text-xs text-red-700">{error}</div> : null}
        </div>
    );
}

function FieldArea({ label, value, onChange, placeholder, error }) {
    return (
        <div>
            <div className="text-xs font-semibold text-slate-700">{label}</div>
            <textarea
                rows={4}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={
                    "mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 " +
                    (error ? "border-red-300 focus:ring-red-200" : "border-slate-200 focus:ring-slate-300")
                }
            />
            {error ? <div className="mt-1 text-xs text-red-700">{error}</div> : null}
        </div>
    );
}

function Stat({ label, value, Icon }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-slate-600">{label}</div>
                <Icon className="h-4 w-4 text-slate-500" />
            </div>
            <div className="text-lg font-semibold leading-6 mt-1 text-slate-900">{value}</div>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="p-5">
                <div className="text-base font-semibold text-slate-900">{title}</div>
                <div className="mt-4 space-y-4">{children}</div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-600">{label}</div>
            <div className="text-sm font-medium mt-1 break-words text-slate-900">{value}</div>
        </div>
    );
}

function TabButton({ active, children, onClick }) {
    return (
        <button
            onClick={onClick}
            className={
                "rounded-2xl px-4 py-2 text-sm font-semibold " +
                (active ? "bg-slate-900 text-white" : "bg-white text-slate-800 ring-1 ring-black/5 hover:bg-slate-50")
            }
        >
            {children}
        </button>
    );
}

function PublicationCard({ pub, handleClickArticle }) {
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="p-5 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <Pill>{pub.type}</Pill>
                            <Pill outline>{pub.year ?? "—"}</Pill>
                            <Pill outline>Цитирований: {pub.citations}</Pill>
                            {pub.pdfUrl ? <Pill outline>PDF</Pill> : null}
                            {pub.views ? <Pill outline>Просмотры: {pub.views}</Pill> : null}
                            {pub.downloads ? <Pill outline>Загрузки: {pub.downloads}</Pill> : null}
                        </div>

                        <h3
                            onClick={() => handleClickArticle(pub.articleProviderId)}
                            className="text-base sm:text-lg font-semibold leading-snug text-slate-900 cursor-pointer"
                        >
                            {pub.title}
                        </h3>

                        <div className="text-sm text-slate-600">
                            <span className="font-medium text-slate-900">{pub.venue}</span>
                            <span className="mx-2">•</span>
                            <span>{formatAuthors(pub.authors, 3)}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:justify-end">
                        {pub.sourceUrl && (
                            <a
                                href={pub.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                                <ExternalLink className="h-4 w-4" />
                                Страница
                            </a>
                        )}
                        {pub.pdfUrl && (
                            <a
                                href={pub.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                            >
                                <Download className="h-4 w-4" />
                                PDF
                            </a>
                        )}
                    </div>
                </div>

                {pub.abstract ? (
                    <p className="text-sm text-slate-600 leading-relaxed">{pub.abstract}</p>
                ) : null}

                {pub.keywords?.length ? (
                    <div className="flex flex-wrap gap-2">
                        {pub.keywords.map((k) => (
                            <Pill key={k} outline>
                                {k}
                            </Pill>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

function Pill({ children, outline }) {
    return (
        <span
            className={
                "rounded-full px-3 py-1 text-xs font-medium " +
                (outline ? "border border-slate-200 bg-white text-slate-700" : "bg-slate-100 text-slate-700")
            }
        >
      {children}
    </span>
    );
}
