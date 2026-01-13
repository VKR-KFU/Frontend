import React, { useEffect, useMemo, useState } from "react";
import { searchArticles } from "../api/articleApi";
import ArticleFilters from "../components/articles/ArticleFilters";
import ArticleCard from "../components/articles/ArticleCard";
import Pagination from "../components/common/Pagination";
import { useNavigate } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";

const PAGE_SIZE = 20;

const INITIAL_FILTERS = {
    // Автор
    authorName: "",
    authorOrg: "",
    authorDepartment: "",
    authorSpin: "",

    // Публикация / источник
    year: "",
    source: "",
    universityName: "",
    publicationType: "",
    language: "",
    edn: "",

    // Доп инф.
    hasFull: false,

    // Аннотации и ключевые слова
    abstractRuText: "",
    abstractEnText: "",
    hasAbstractRu: false,
    hasAbstractEn: false,
    keywordsText: [],

    // Индексация / классификация
    isRinc: false,
    isCoreRinc: false,
    oecdCodeName: "",
    asjcCodeName: "",
    vakCodeName: "",
    patents: "",

    // Метрики
    minViews: "",
    minCitationsRinc: "",
    minCitirovanieInCoreRinc: "",

    // Альтметрики
    altmetricAllScoreMin: "",
    altmetricViewsMin: "",
    altmetricDownloadsMin: "",
    altmetricIncludedInCollectionsMin: "",
    altmetricTotalReviewsMin: "",
};

export default function ArticlesPage() {
    // поиск по названию (у тебя переменная title)
    const [title, setTitle] = useState("");

    // фильтры
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [items, setItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    const [page, setPage] = useState(1);
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // открыто ли модальное окно фильтров
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const navigate = useNavigate();

    const buildRequestBody = (pageToLoad) => {
        return {
            pageSize: PAGE_SIZE,
            page: pageToLoad,
            title: title || undefined,
            authors: [
                {
                    fullName: filters.authorName || undefined,
                    department: filters.authorDepartment || undefined,
                    spinCode: filters.authorSpin || undefined,
                    organization: filters.authorOrg || undefined,
                },
            ],
            altmetric: {
                allScoreMin: filters.altmetricAllScoreMin
                    ? Number(filters.altmetricAllScoreMin)
                    : undefined,
                viewsMin: filters.altmetricViewsMin
                    ? Number(filters.altmetricViewsMin)
                    : undefined,
                downloadsMin: filters.altmetricDownloadsMin
                    ? Number(filters.altmetricDownloadsMin)
                    : undefined,
                includedInCollectionsMin: filters.altmetricIncludedInCollectionsMin
                    ? Number(filters.altmetricIncludedInCollectionsMin)
                    : undefined,
                totalReviewsMin: filters.altmetricTotalReviewsMin
                    ? Number(filters.altmetricTotalReviewsMin)
                    : undefined,
            },
            articleDetails: {
                year: filters.year ? Number(filters.year) : undefined,
                source: filters.source || undefined,
                universityName: filters.universityName || undefined,
                publicationType: filters.publicationType || undefined,
                edn: filters.edn || undefined,
                patents: filters.patents || undefined,

                ruAnnotation:
                    filters.abstractRuText ||
                    (filters.hasAbstractRu ? "__NOT_EMPTY__" : undefined),
                enAnnotation:
                    filters.abstractEnText ||
                    (filters.hasAbstractEn ? "__NOT_EMPTY__" : undefined),

                language: filters.language || undefined,

                keywords: filters.keywordsText || undefined,
                isRinc: filters.isRinc || undefined,
                isCoreRinc: filters.isCoreRinc || undefined,
                oecdCodeName: filters.oecdCodeName || undefined,
                asjcCodeName: filters.asjcCodeName || undefined,
                vakCodeName: filters.vakCodeName || undefined,
                minViews: filters.minViews ? Number(filters.minViews) : undefined,
                minCitationsRinc: filters.minCitationsRinc
                    ? Number(filters.minCitationsRinc)
                    : undefined,
                minCitirovanieInCoreRinc: filters.minCitirovanieInCoreRinc
                    ? Number(filters.minCitirovanieInCoreRinc)
                    : undefined,
            },
        };
    };

    const loadData = async (pageToLoad = 1) => {
        setLoading(true);
        setError(null);
        try {
            const body = buildRequestBody(pageToLoad);
            const data = await searchArticles(body);

            setItems(data.items || data.articles || []);
            setTotalCount(data.total ?? data.totalCount ?? 0);
            setPage(pageToLoad);
        } catch (e) {
            console.error(e);
            setError(e.message || "Произошла ошибка при загрузке статей");
        } finally {
            setLoading(false);
        }
    };

    const handleChangeFilter = (name, value) => {
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleResetFilters = () => {
        setFilters(INITIAL_FILTERS);
        loadData(1);
    };

    const handleApplyFilters = () => {
        loadData(1);
        setIsFiltersOpen(false);
    };

    const handleOpenProvider = (articleId, providerId, provider) => {
        navigate(`/article/${providerId}`);
        console.log("open provider details", articleId, providerId, provider);
    };

    // маленький индикатор “фильтры активны”
    const filtersActive = useMemo(() => {
        const f = filters;

        const hasAny =
            (title || "").trim().length > 0 ||
            (f.authorName || "").trim().length > 0 ||
            (f.authorOrg || "").trim().length > 0 ||
            (f.authorDepartment || "").trim().length > 0 ||
            (f.authorSpin || "").trim().length > 0 ||
            (f.year || "").trim().length > 0 ||
            (f.source || "").trim().length > 0 ||
            (f.universityName || "").trim().length > 0 ||
            (f.publicationType || "").trim().length > 0 ||
            (f.language || "").trim().length > 0 ||
            (f.edn || "").trim().length > 0 ||
            f.hasFull ||
            (f.abstractRuText || "").trim().length > 0 ||
            (f.abstractEnText || "").trim().length > 0 ||
            f.hasAbstractRu ||
            f.hasAbstractEn ||
            (f.keywordsText && f.keywordsText.length > 0) ||
            f.isRinc ||
            f.isCoreRinc ||
            (f.oecdCodeName || "").trim().length > 0 ||
            (f.asjcCodeName || "").trim().length > 0 ||
            (f.vakCodeName || "").trim().length > 0 ||
            (f.patents || "").trim().length > 0 ||
            (f.minViews || "").trim().length > 0 ||
            (f.minCitationsRinc || "").trim().length > 0 ||
            (f.minCitirovanieInCoreRinc || "").trim().length > 0 ||
            (f.altmetricAllScoreMin || "").trim().length > 0 ||
            (f.altmetricViewsMin || "").trim().length > 0 ||
            (f.altmetricDownloadsMin || "").trim().length > 0 ||
            (f.altmetricIncludedInCollectionsMin || "").trim().length > 0 ||
            (f.altmetricTotalReviewsMin || "").trim().length > 0;

        return hasAny;
    }, [filters, title]);

    useEffect(() => {
        loadData(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-700">
                <div className="mx-auto max-w-6xl px-4 py-10">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="text-white">
                            <div className="text-sm text-white/80">Публикации</div>
                            <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                                Поиск статей
                            </h1>
                            <div className="mt-1 text-sm text-white/80">
                                Ищи по названию и используй расширенные фильтры (авторы, источники,
                                метрики и т.д.)
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setIsFiltersOpen(true)}
                                className={
                                    "rounded-xl px-4 py-2 text-sm font-medium ring-1 " +
                                    (filtersActive
                                        ? "bg-white text-slate-900 ring-white/30 hover:bg-white/90"
                                        : "bg-white/10 text-white ring-white/20 hover:bg-white/15")
                                }
                            >
                <span className="inline-flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Фильтры
                    {filtersActive ? (
                        <span className="ml-1 inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    ) : null}
                </span>
                            </button>

                            <button
                                onClick={() => {
                                    setTitle("");
                                    setFilters(INITIAL_FILTERS);
                                    loadData(1);
                                }}
                                className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/15"
                            >
                                Сброс
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Поиск по названию статьи…"
                                className="w-full rounded-2xl bg-white/10 px-9 py-3 text-sm text-white placeholder:text-white/60 outline-none ring-1 ring-white/15 focus:ring-2 focus:ring-white/30"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") loadData(1);
                                }}
                            />
                            {title && (
                                <button
                                    onClick={() => setTitle("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-white/70 hover:bg-white/10"
                                    aria-label="Очистить поиск"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="mt-3 flex items-center justify-between text-sm text-white/80">
                            <div>
                                Найдено:{" "}
                                <span className="font-semibold text-white">
                  {loading ? "..." : totalCount}
                </span>
                            </div>
                            <div className="hidden sm:block">
                                Нажми Enter или кнопку фильтров, чтобы обновить выдачу
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
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
                                Попробуйте изменить запрос или фильтры.
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !error && items.length > 0 && (
                    <div className="space-y-4">
                        {items.map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                                onOpenProvider={handleOpenProvider}
                            />
                        ))}
                    </div>
                )}

                {!loading && !error && totalPages > 1 && (
                    <div className="mt-6">
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onChange={(newPage) => loadData(newPage)}
                        />
                    </div>
                )}
            </div>

            {isFiltersOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={() => setIsFiltersOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/40" />

                    <div
                        className="relative w-full max-w-4xl rounded-2xl bg-white shadow-xl ring-1 ring-black/10
                 max-h-[85vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header (не скроллится) */}
                        <div className="flex items-start justify-between p-5 border-b border-slate-200">
                            <div>
                                <div className="text-lg font-semibold text-slate-900">Фильтры</div>
                                <div className="mt-1 text-sm text-slate-600">
                                    Настрой параметры и нажми “Применить”.
                                </div>
                            </div>

                            <button
                                className="rounded-xl p-2 hover:bg-slate-100"
                                onClick={() => setIsFiltersOpen(false)}
                                aria-label="Закрыть"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body (скроллится) */}
                        <div className="p-5 overflow-y-auto">
                            <ArticleFilters
                                {...filters}
                                onChange={handleChangeFilter}
                                onReset={() => {
                                    handleResetFilters();
                                    setIsFiltersOpen(false);
                                }}
                                onApply={handleApplyFilters}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
