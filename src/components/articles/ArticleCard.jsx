import React, { useMemo, useState } from "react";
import {
    ChevronDown,
    FileText,
    GraduationCap,
    Users,
    ExternalLink,
    Download,
} from "lucide-react";

function formatAuthors(authors, limit = 2) {
    if (!Array.isArray(authors) || authors.length === 0) return "";
    const head = authors.slice(0, limit).map((a) => a.fullName).join(", ");
    const rest = authors.length - limit;
    return rest > 0 ? `${head} и ещё ${rest}` : head;
}

export default function ArticleCard({ article, onOpenProvider }) {
    const {
        title,
        year,
        authors,
        articleDetails,
        providers = [],
        hasPdf,
        hasFull,
    } = article || {};

    const [isOpen, setIsOpen] = useState(false);

    const hasAuthors = Array.isArray(authors) && authors.length > 0;
    const authorsText = hasAuthors ? formatAuthors(authors, 2) : "Автор не указан";

    const isFilled = !!hasFull;

    const handleCardClick = () => {
        setIsOpen((prev) => !prev);
    };

    const handleProviderClick = (e, provider, index) => {
        e.stopPropagation();
        if (onOpenProvider) onOpenProvider(article.id, provider.id ?? index, provider);
    };

    const chips = useMemo(() => {
        const res = [];
        if (year) res.push({ key: "year", label: String(year) });
        if (typeof hasPdf === "boolean") res.push({ key: "pdf", label: hasPdf ? "PDF доступен" : "PDF нет" });
        res.push({ key: "filled", label: isFilled ? "Статья заполнена" : "Не заполнена", tone: isFilled ? "ok" : "warn" });
        return res;
    }, [year, hasPdf, isFilled]);

    return (
        <article
            className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md transition cursor-pointer"
            onClick={handleCardClick}
        >
            <div className="p-5 space-y-3">
                {/* Top row */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold leading-snug text-slate-900 break-words">
                            {title}
                        </h3>

                        <div className="mt-2 flex flex-wrap gap-2">
                            {chips.map((c) => (
                                <Pill
                                    key={c.key}
                                    tone={c.tone}
                                    outline={c.key !== "filled"} // заполненность выделим фоном
                                >
                                    {c.label}
                                </Pill>
                            ))}
                        </div>
                    </div>

                    <div className="shrink-0">
                        <div
                            className={
                                "rounded-xl p-2 hover:bg-slate-50 transition " +
                                (isOpen ? "bg-slate-50" : "")
                            }
                            aria-label="Развернуть"
                        >
                            <ChevronDown
                                className={
                                    "h-5 w-5 text-slate-600 transition-transform " +
                                    (isOpen ? "rotate-180" : "")
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Meta line */}
                <div className="flex flex-col gap-2 text-sm text-slate-600">
                    <div className="inline-flex items-center gap-2 min-w-0">
                        <Users className="h-4 w-4 text-slate-500" />
                        <span className={hasAuthors ? "truncate" : "text-slate-500"}>
              {hasAuthors ? authorsText : "Автор не указан"}
            </span>
                    </div>

                    {articleDetails?.universityName ? (
                        <div className="inline-flex items-center gap-2 min-w-0">
                            <GraduationCap className="h-4 w-4 text-slate-500" />
                            <span className="truncate">{articleDetails.universityName}</span>
                        </div>
                    ) : null}
                </div>

                {/* Providers раскрытие */}
                {providers.length > 0 && (
                    <div
                        className={
                            "overflow-hidden transition-all duration-300 " +
                            (isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0")
                        }
                    >
                        <div className="pt-3">
                            <div className="text-xs font-semibold text-slate-700 mb-2">
                                Источники
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {providers.map((p, index) => (
                                    <button
                                        key={p.id ?? index}
                                        type="button"
                                        onClick={(e) => handleProviderClick(e, p, index)}
                                        className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:bg-slate-50 transition"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-slate-900 truncate">
                                                    {p.source || `Источник ${index + 1}`}
                                                </div>

                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    {p.year ? <Pill outline>{p.year}</Pill> : null}
                                                    {p.language ? (
                                                        <Pill outline>{String(p.language).toUpperCase()}</Pill>
                                                    ) : null}
                                                    {p.publicationType ? (
                                                        <Pill outline>{p.publicationType}</Pill>
                                                    ) : null}
                                                </div>
                                            </div>

                                            <ExternalLink className="h-4 w-4 text-slate-500 shrink-0" />
                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            <Pill outline tone={p.pdfUrl ? "ok" : "muted"}>
                                                <FileText className="inline-block h-4 w-4 mr-2" />
                                                {p.pdfUrl ? "PDF" : "PDF нет"}
                                            </Pill>

                                            {p.pdfUrl ? (
                                                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                          <Download className="h-4 w-4" />
                          Скачать
                        </span>
                                            ) : null}
                                        </div>

                                        {/* Mini stats */}
                                        <div className="mt-3 grid grid-cols-2 gap-2">
                                            <MiniStat label="Просмотры" value={p.altmetric?.views ?? 0} />
                                            <MiniStat label="Скачивания" value={p.altmetric?.countDownloaded ?? 0} />
                                            <MiniStat label="Цитир. РИНЦ" value={p.citirovanieInRinc ?? 0} />
                                            <MiniStat label="Core РИНЦ" value={p.citirovanieInCoreRinc ?? 0} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

function Pill({ children, outline, tone }) {
    const toneCls =
        tone === "ok"
            ? outline
                ? "border-emerald-200 text-emerald-700"
                : "bg-emerald-600 text-white"
            : tone === "warn"
                ? outline
                    ? "border-amber-200 text-amber-800"
                    : "bg-amber-500 text-white"
                : tone === "muted"
                    ? outline
                        ? "border-slate-200 text-slate-500"
                        : "bg-slate-200 text-slate-700"
                    : outline
                        ? "border border-slate-200 bg-white text-slate-700"
                        : "bg-slate-100 text-slate-700";

    return (
        <span
            className={
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium " +
                (outline ? "border " : "") +
                toneCls
            }
        >
      {children}
    </span>
    );
}

function MiniStat({ label, value }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
            <div className="text-[11px] text-slate-600">{label}</div>
            <div className="text-sm font-semibold text-slate-900 mt-0.5">
                {value}
            </div>
        </div>
    );
}
