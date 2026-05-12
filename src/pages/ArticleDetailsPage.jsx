import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {getArticleById, getSimilarArticles, pdfDownloaded} from "../api/articleApi";

import * as signalR from "@microsoft/signalr";
import { getSignalRConnection } from "../signalrConnection";

import {
    ArrowLeft,
    Bell,
    BellOff,
    FileText,
    Globe,
    GraduationCap,
    Link as LinkIcon,
    ShieldCheck,
    Download,
    Sparkles,
    ChevronRight,
} from "lucide-react";
import {getArticleDetailStatistic} from "../api/articleStatisticApi";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    LabelList,
} from "recharts";

export default function ArticleDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [article, setArticle] = useState(null);
    const [statistic, setStatistic] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [annotationIndex, setAnnotationIndex] = useState(0);

    // уведомления
    const [notifySubscribed, setNotifySubscribed] = useState(false);
    const [notifyLoading, setNotifyLoading] = useState(false);

    const [similar, setSimilar] = useState({ items: [], loading: false, error: null });

    // 1) загрузка статьи
    useEffect(() => {
        if (!id) return;
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await getArticleById(id);
                const statistic = await getArticleDetailStatistic(id);
                if (cancelled) return;
                setArticle(data || null);
                setStatistic(statistic || null);
            } catch (e) {
                if (cancelled) return;
                setError(e.message || "Ошибка при загрузке статьи");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // 2) вычисления
    const provider = article?.provider ?? {};
    const providerId = provider?.id;

    const pdfDownloadsCount = statistic?.pdfDownloadsCount ?? 0;
    const viewsCount = statistic?.viewsCount ?? 0;
    const authors = Array.isArray(article?.authors) ? article.authors : [];
    const annotations = Array.isArray(provider?.annotations) ? provider.annotations : [];
    const keywords = Array.isArray(provider?.keywords) ? provider.keywords : [];
    const url = provider?.pdfUrl?.replace(
        "http://minio:9000",
        "http://localhost:3001/minio"
    );

    const conversion = useMemo(() => {
        if (!viewsCount) return 0;
        return (pdfDownloadsCount / viewsCount) * 100;
    }, [pdfDownloadsCount, viewsCount]);

    const conversionRounded = useMemo(() => Math.round(conversion * 10) / 10, [conversion]);
    const conversionBar = useMemo(() => Math.min(100, Math.max(0, conversion)), [conversion]);

    const isFull = !!provider?.hasFull;

    useEffect(() => {
        setAnnotationIndex(0);
    }, [article?.id, annotations.length]);

    const activeAnnotation = annotations[annotationIndex] || null;

    useEffect(() => {
        const connection = getSignalRConnection();

        const handler = (payload) => {
            if (!providerId || payload?.articleProviderId !== providerId) return;

            getArticleById(id)
                .then((data) => setArticle(data || null))
                .catch((e) => console.error("Ошибка при обновлении статьи:", e));
        };

        connection.on("NotifyArticleUpdated", handler);

        return () => {
            connection.off("NotifyArticleUpdated", handler);
        };
    }, [id, providerId]);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setSimilar({ items: [], loading: true, error: null });
        getSimilarArticles(id, 10)
            .then((data) => {
                if (cancelled) return;
                setSimilar({
                    items: Array.isArray(data?.items) ? data.items : [],
                    loading: false,
                    error: null,
                });
            })
            .catch((e) => {
                if (cancelled) return;
                setSimilar({
                    items: [],
                    loading: false,
                    error: e?.message || "Не удалось загрузить похожие публикации",
                });
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleClick = () => {
        pdfDownloaded(id).catch(() => {});
    }

    const handleNotifyClick = async () => {
        if (!providerId) return;

        const connection = getSignalRConnection();

        try {
            setNotifyLoading(true);

            if (connection.state === signalR.HubConnectionState.Disconnected) {
                await connection.start();
            }

            if (!notifySubscribed) {
                await connection.invoke("SubscribeArticle", providerId);
                setNotifySubscribed(true);
            } else {
                await connection.invoke("UnsubscribeArticle", providerId);
                setNotifySubscribed(false);
            }
        } catch (e) {
            console.error("Ошибка подписки на статью:", e);
        } finally {
            setNotifyLoading(false);
        }
    };

    // ---- UI states ----
    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 p-8 text-center text-slate-600">
                        Загрузка…
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50">
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (!article) return null;

    const displayYear = provider?.year ?? article?.year ?? null;

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-700">
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/15 hover:bg-white/15"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        К списку статей
                    </button>

                    <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="text-white min-w-0">
                            <div className="text-sm text-white/80">Статья</div>

                            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight leading-snug break-words">
                                {article.title}
                            </h1>

                            <div className="mt-3 text-sm text-white/85">
                                {authors.length > 0 ? (
                                    <span className="break-words">
                    {authors.map((a) => a.fullName).join(", ")}
                  </span>
                                ) : (
                                    <span className="text-white/70">Автор не указан</span>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                {displayYear && <ChipDark>{displayYear}</ChipDark>}
                                {provider?.language && (
                                    <ChipDark>
                                        <Globe className="h-4 w-4" />
                                        {String(provider.language).toUpperCase()}
                                    </ChipDark>
                                )}
                                {provider?.source && <ChipDark>{provider.source}</ChipDark>}
                                <ChipDark>
                                    <FileText className="h-4 w-4" />
                                    {provider?.pdfUrl ? "PDF доступен" : "PDF не доступен"}
                                </ChipDark>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2 lg:items-end">
                            {isFull ? (
                                <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-50 ring-1 ring-emerald-200/20">
                                    <ShieldCheck className="h-4 w-4" />
                                    Эта статья уже заполнена
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNotifyClick}
                                    disabled={notifyLoading}
                                    className={
                                        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 transition " +
                                        (notifySubscribed
                                            ? "bg-white text-slate-900 ring-white/20 hover:bg-white/90"
                                            : "bg-white/10 text-white ring-white/15 hover:bg-white/15") +
                                        (notifyLoading ? " opacity-70" : "")
                                    }
                                >
                                    {notifySubscribed ? (
                                        <>
                                            <BellOff className="h-4 w-4" />
                                            Уведомления включены
                                        </>
                                    ) : (
                                        <>
                                            <Bell className="h-4 w-4" />
                                            Уведомить, когда статья будет заполнена
                                        </>
                                    )}
                                </button>
                            )}

                            <div className="flex gap-2">
                                <a
                                    href={url || undefined}
                                    onClick={() => { if (url) handleClick(); }}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={
                                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 " +
                                        (url
                                            ? "bg-white/10 text-white ring-white/15 hover:bg-white/15"
                                            : "bg-white/5 text-white/50 ring-white/10 cursor-not-allowed pointer-events-none")
                                    }
                                >
                                    <Download className="h-4 w-4" />
                                    PDF
                                </a>

                                <a
                                    href={provider?.sourceUrl || undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={
                                        "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium ring-1 " +
                                        (provider?.sourceUrl
                                            ? "bg-white/10 text-white ring-white/15 hover:bg-white/15"
                                            : "bg-white/5 text-white/50 ring-white/10 cursor-not-allowed pointer-events-none")
                                    }
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    Источник
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main */}
            <div className="mx-auto max-w-6xl px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left */}
                    <div className="lg:col-span-7 space-y-6">
                        {/* Authors card */}
                        <Card title="Авторы и организации">
                            {authors.length === 0 ? (
                                <div className="text-sm text-slate-600">Автор не указан.</div>
                            ) : (
                                <div className="space-y-3">
                                    {authors.map((a, idx) => (
                                        <div
                                            key={idx}
                                            className="rounded-xl border border-slate-200 p-3"
                                        >
                                            <div className="text-sm font-medium text-slate-900">
                                                {a.fullName}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-600">
                                                {a.department ? <span>{a.department}</span> : null}
                                                {a.organization ? (
                                                    <>
                                                        {a.department ? <span> • </span> : null}
                                                        <span>{a.organization}</span>
                                                    </>
                                                ) : null}
                                                {a.spinCode ? <> • SPIN: {a.spinCode}</> : null}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {provider?.universityName ? (
                                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
                                      <span className="inline-flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Базовый вуз:{" "}
                                          <span className="font-semibold text-slate-900">
                                          {provider.universityName}
                                        </span>
                                      </span>
                                </div>
                            ) : null}

                            {provider?.journal ? (
                                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-3 text-sm text-slate-700">
                                      <span className="inline-flex items-center gap-2">
                                        <GraduationCap className="h-4 w-4" />
                                        Журнал:{" "}
                                          <span className="font-semibold text-slate-900">
                                          {provider.journal}
                                        </span>
                                      </span>
                                </div>
                            ) : null}
                        </Card>

                        {/* Annotation card */}
                        <Card title="Аннотация">
                            {annotations.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {annotations.map((a, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setAnnotationIndex(idx)}
                                            className={
                                                "rounded-2xl px-4 py-2 text-sm font-semibold transition " +
                                                (annotationIndex === idx
                                                    ? "bg-slate-900 text-white"
                                                    : "bg-white text-slate-800 ring-1 ring-black/5 hover:bg-slate-50")
                                            }
                                        >
                                            {a.displayName ||
                                                (a.languageCode ? String(a.languageCode).toUpperCase() : null) ||
                                                `Аннотация ${idx + 1}`}
                                        </button>
                                    ))}
                                </div>
                            ) : null}

                            {annotations.length === 0 ? (
                                <div className="text-sm text-slate-600">Аннотация не указана.</div>
                            ) : activeAnnotation ? (
                                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                                    {activeAnnotation.text}
                                </p>
                            ) : null}
                        </Card>

                        {/* Keywords */}
                        <Card title="Ключевые слова">
                            {keywords.length ? (
                                <div className="flex flex-wrap gap-2">
                                    {keywords.map((kw, idx) => (
                                        <Pill key={idx} outline>
                                            {kw}
                                        </Pill>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-slate-600">Ключевые слова не указаны.</div>
                            )}
                        </Card>
                    </div>

                    {/* Right */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Bibliography */}
                        <Card title="Библиографические данные">
                            <InfoRow label="Источник" value={provider?.source || "—"} />
                            <InfoRow label="Тип публикации" value={provider?.publicationType || "—"} />
                            <InfoRow label="Год" value={displayYear ?? "—"} />
                            <InfoRow label="Университет" value={provider?.universityName || "—"} />
                            <InfoRow label="ASJC" value={provider?.asjcCodeName || "—"} />
                            <InfoRow label="OECD" value={provider?.oecdCodeName || "—"} />
                            <InfoRow label="ВАК" value={provider?.vakCodeName || "—"} />
                            <InfoRow label="EDN" value={provider?.edn || "—"} />
                        </Card>

                        {/* Metrics */}
                        <Card title="Метрики">
                            <div className="grid grid-cols-2 gap-3">
                                <Metric label="Просмотры" value={statistic?.viewsCount ?? 0} />
                                <Metric label="Скачивания" value={statistic?.pdfDownloadsCount ?? 0} />
                                {/*<Metric*/}
                                {/*    label="В коллекциях"*/}
                                {/*    value={provider?.altmetric?.includedInCollections ?? 0}*/}
                                {/*/>*/}
                                {/*<Metric label="Отзывы" value={provider?.altmetric?.totalReviews ?? 0} />*/}
                                {/*<div className="col-span-2">*/}
                                {/*    <MetricWide*/}
                                {/*        label="Общий балл"*/}
                                {/*        value={provider?.altmetric?.allScore ?? 0}*/}
                                {/*        Icon={Star}*/}
                                {/*    />*/}
                                {/*</div>*/}
                            </div>

                            <div className="mt-4 rounded-xl border border-slate-200 p-3">
                                <div className="text-sm text-slate-700">
                                    Цитирования (РИНЦ):{" "}
                                    <span className="font-semibold text-slate-900">
                                        {provider?.citirovanieInRinc ?? 0}
                                    </span>
                                </div>
                                <div className="mt-1 text-sm text-slate-700">
                                    Цитирования (ядро РИНЦ):{" "}
                                     <span className="font-semibold text-slate-900">
                                        {provider?.citirovanieInCoreRinc ?? 0}
                                      </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {provider?.isRinc ? <Pill>Входит в РИНЦ</Pill> : null}
                                    {provider?.isCoreRinc ? <Pill>Ядро РИНЦ</Pill> : null}
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-sm font-semibold text-slate-900 mb-2">
                                    Просмотры и скачивания
                                </div>
                                <ViewsDownloadsBar views={viewsCount} downloads={pdfDownloadsCount} />
                            </div>
                        </Card>

                        <Card title="Интеллектуальная поддержка: похожие публикации">
                            <p className="text-xs text-slate-600 -mt-2 mb-3">
                                Ранжирование по пересечению ключевых слов и лексическому сходству заголовка и аннотаций
                                (PostgreSQL, расширение{" "}
                                <span className="font-mono text-slate-800">pg_trgm</span>).
                            </p>
                            {similar.loading ? (
                                <div className="text-sm text-slate-600">Подбор похожих…</div>
                            ) : similar.error ? (
                                <div className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                                    {similar.error}
                                </div>
                            ) : similar.items.length === 0 ? (
                                <div className="text-sm text-slate-600">
                                    Похожие записи не найдены (мало данных или низкая схожесть).
                                </div>
                            ) : (
                                <ul className="space-y-2">
                                    {similar.items.map((item) => (
                                        <li key={item.providerId}>
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/article/${item.providerId}`)}
                                                className="w-full text-left rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-100 transition px-3 py-2.5 group"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <Sparkles className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="text-sm font-medium text-slate-900 leading-snug break-words group-hover:underline">
                                                            {item.title}
                                                        </div>
                                                        <div className="mt-1 flex flex-wrap gap-1.5 items-center">
                                                            {item.year != null ? (
                                                                <Pill outline>{item.year}</Pill>
                                                            ) : null}
                                                            {item.source ? <Pill outline>{item.source}</Pill> : null}
                                                            <Pill outline>
                                                                Ключ. слова: {item.keywordOverlap}
                                                            </Pill>
                                                            <Pill outline>
                                                                Лексика:{" "}
                                                                {Math.round((item.textSimilarity || 0) * 100)}%
                                                            </Pill>
                                                            <Pill outline>
                                                                Итог: {Math.round((item.combinedScore || 0) * 100)}%
                                                            </Pill>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0 mt-1" />
                                                </div>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Card>

                        {/* Links */}
                        <Card title="Ссылки">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <a
                                    href={url || undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={
                                        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium " +
                                        (url
                                            ? "bg-slate-900 text-white hover:bg-slate-800"
                                            : "bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none")
                                    }
                                >
                                    <Download className="h-4 w-4" />
                                    Открыть PDF
                                </a>

                                <a
                                    href={provider?.sourceUrl || undefined}
                                    target="_blank"
                                    rel="noreferrer"
                                    className={
                                        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium " +
                                        (provider?.sourceUrl
                                            ? "border border-slate-200 text-slate-800 hover:bg-slate-50"
                                            : "bg-slate-200 text-slate-500 cursor-not-allowed pointer-events-none")
                                    }
                                >
                                    <LinkIcon className="h-4 w-4" />
                                    Перейти к источнику
                                </a>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ---------- UI helpers ---------- */

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

function ViewsDownloadsBar({ views, downloads }) {
    const v = Math.max(0, Number(views) || 0);
    const d = Math.max(0, Number(downloads) || 0);

    const data = [
        { name: "Просмотры", value: v },
        { name: "Скачивания", value: d },
    ];

    const max = Math.max(v, d, 1);

    return (
        <div className="h-56 rounded-2xl border border-slate-200 bg-white p-3">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 18, right: 12, left: 0, bottom: 8 }}
                    barCategoryGap="35%"
                >
                    {/* более мягкая сетка */}
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        style={{ fontSize: 12 }}
                    />
                    <YAxis
                        allowDecimals={false}
                        tickLine={false}
                        axisLine={false}
                        width={28}
                        domain={[0, Math.ceil(max * 1.2)]}
                        style={{ fontSize: 12 }}
                    />
                    <Tooltip
                        cursor={{ opacity: 0.15 }}
                        formatter={(value) => [value, ""]}
                    />
                    <Bar dataKey="value" radius={[12, 12, 12, 12]}>
                        {/* подписи значений */}
                        <LabelList dataKey="value" position="top" style={{ fontSize: 12 }} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

function ChipDark({ children }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-white/15">
      {children}
    </span>
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

function InfoRow({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-600">{label}</div>
            <div className="text-sm font-medium mt-1 break-words text-slate-900">
                {value}
            </div>
        </div>
    );
}

function Metric({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="text-xs text-slate-600">{label}</div>
            <div className="text-lg font-semibold leading-6 mt-1 text-slate-900">
                {value}
            </div>
        </div>
    );
}

function MetricWide({ label, value, Icon }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="flex items-center justify-between gap-2">
                <div className="text-xs text-slate-600">{label}</div>
                {Icon ? <Icon className="h-4 w-4 text-slate-500" /> : null}
            </div>
            <div className="text-lg font-semibold leading-6 mt-1 text-slate-900">
                {value}
            </div>
        </div>
    );
}
