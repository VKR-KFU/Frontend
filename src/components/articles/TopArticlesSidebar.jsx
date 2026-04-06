import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Download, Percent, RefreshCw } from "lucide-react";
import { getTopArticlesStatistic } from "../../api/articleStatisticApi";
import { getArticleById } from "../../api/articleApi";

const TABS = [
    { key: "views", title: "Просмотры", Icon: Eye },
    { key: "downloads", title: "Скачивания", Icon: Download },
    { key: "conversion", title: "Конверсия", Icon: Percent },
];

function metricLabel(tabKey) {
    if (tabKey === "views") return "просм.";
    if (tabKey === "downloads") return "скач.";
    return "%";
}

export default function TopArticlesSidebar({ limit = 5, period = "7d", basePath = "/article" }) {
    const navigate = useNavigate();

    const [tab, setTab] = useState("views");
    const [items, setItems] = useState([]); // enriched items: { articleId, title, views, downloads, conversion }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const load = async (tabKey) => {
        try {
            setLoading(true);
            setError(null);

            const top = await getTopArticlesStatistic({ metric: tabKey, period, limit });
            const raw = Array.isArray(top?.items) ? top.items : [];

            // подтягиваем titles параллельно
            const enriched = await Promise.all(
                raw.map(async (x) => {
                    try {
                        const article = await getArticleById(x.articleId);
                        const title = article?.title || article?.provider?.title || null;
                        return { ...x, title };
                    } catch {
                        return { ...x, title: null };
                    }
                })
            );

            setItems(enriched);
        } catch (e) {
            setError(e?.message || "Ошибка загрузки статистики");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(tab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tab, period, limit]);

    const metricValue = (item) => {
        if (tab === "views") return item.views ?? 0;
        if (tab === "downloads") return item.downloads ?? 0;
        const v = Number(item.conversion ?? 0);
        return Math.round(v * 10) / 10;
    };

    const barWidth = (item, first) => {
        if (!first) return "0%";

        if (tab === "conversion") {
            const c = Number(item.conversion ?? 0);
            return `${Math.min(100, Math.max(0, c))}%`;
        }

        const denom =
            tab === "views"
                ? Math.max(1, Number(first.views ?? 1))
                : Math.max(1, Number(first.downloads ?? 1));

        const num = tab === "views" ? Number(item.views ?? 0) : Number(item.downloads ?? 0);
        return `${Math.min(100, Math.max(0, (num / denom) * 100))}%`;
    };

    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="p-5">
                <div className="flex items-center justify-between gap-2">
                    <div className="text-base font-semibold text-slate-900">Топ статей</div>

                    <button
                        type="button"
                        onClick={() => load(tab)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        title="Обновить"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Обновить
                    </button>
                </div>

                {/* Tabs */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {TABS.map(({ key, title, Icon }) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={
                                "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition " +
                                (tab === key
                                    ? "bg-slate-900 text-white"
                                    : "bg-white text-slate-800 ring-1 ring-black/5 hover:bg-slate-50")
                            }
                        >
                            <Icon className="h-4 w-4" />
                            {title}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="mt-4">
                    {loading && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            Загрузка…
                        </div>
                    )}

                    {error && !loading && (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    {!loading && !error && items.length === 0 && (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                            Нет данных.
                        </div>
                    )}

                    {!loading && !error && items.length > 0 && (
                        <div className="space-y-2">
                            {items.map((a, idx) => (
                                <button
                                    key={a.articleId}
                                    type="button"
                                    onClick={() => navigate(`${basePath}/${a.articleId}`)}
                                    className="w-full text-left rounded-xl border border-slate-200 p-3 hover:bg-slate-50 transition"
                                    title={a.title || a.articleId}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-slate-900 line-clamp-2">
                                                {idx + 1}. {a.title || a.articleId}
                                            </div>
                                            <div className="mt-1 text-xs text-slate-500">ID: {a.articleId}</div>
                                        </div>

                                        <div className="shrink-0 text-right">
                                            <div className="text-sm font-semibold text-slate-900">
                                                {metricValue(a)}
                                                <span className="ml-1 text-xs text-slate-500">{metricLabel(tab)}</span>
                                            </div>

                                            <div className="mt-2 h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-2 rounded-full bg-slate-900"
                                                    style={{ width: barWidth(a, items[0]) }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 text-xs text-slate-500">
                        Период: <span className="font-semibold">{period}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
