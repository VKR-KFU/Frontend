import React, { useEffect, useState } from "react";
import { searchArticles } from "../api/articleApi";
import ArticleSearchBar from "../components/articles/ArticleSearchBar";
import ArticleFilters from "../components/articles/ArticleFilters";
import ArticleCard from "../components/articles/ArticleCard";
import Pagination from "../components/common/Pagination";
import "./ArticlesPage.css";
import {useNavigate} from "react-router-dom";

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

    // --- новое: Альтметрики ---
    altmetricAllScoreMin: "",
    altmetricViewsMin: "",
    altmetricDownloadsMin: "",
    altmetricIncludedInCollectionsMin: "",
    altmetricTotalReviewsMin: ""
};

function ArticlesPage() {
    // поиск по названию
    const [title, setTitle] = useState("");

    // фильтры
    const [filters, setFilters] = useState(INITIAL_FILTERS);

    const [items, setItems] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // открыто ли модальное окно с фильтрами
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

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

                // аннотации
                // если нужен поиск по тексту — подставляешь текст
                // если просто наличие — можно договориться с бэкендом о спец-значении
                ruAnnotation: filters.abstractRuText || (filters.hasAbstractRu ? "__NOT_EMPTY__" : undefined),
                enAnnotation: filters.abstractEnText || (filters.hasAbstractEn ? "__NOT_EMPTY__" : undefined),

                // язык
                language: filters.language || undefined,

                // ключевые слова, индексация, классификация, метрики —
                // тут просто накидываю поля, реальные названия подгони под контракт
                keywords: filters.keywordsText || undefined,
                isRinc: filters.isRinc || undefined,
                isCoreRinc: filters.isCoreRinc || undefined,
                oecdCodeName: filters.oecdCodeName || undefined,
                asjcCodeName: filters.asjcCodeName || undefined,
                vakCodeName: filters.vakCodeName || undefined,
                minViews: filters.minViews
                    ? Number(filters.minViews)
                    : undefined,
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
        navigate(`/article/${providerId}`)
        console.log("open provider details", articleId, providerId, provider);
    };


    useEffect(() => {
        loadData(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="articles-page">
            {/* шапка с поиском и кнопкой фильтров */}
            <div className="articles-page__header">
                <div className="articles-page__search">
                    <ArticleSearchBar
                        title={title}
                        onChangeTitle={setTitle}
                        onSearch={() => loadData(1)}
                        onOpenFilters={() => setIsFiltersOpen(true)}
                    />
                </div>
            </div>

            {/* результаты поиска */}
            <section className="articles-page__results">
                {loading && <div className="info-block">Загрузка…</div>}

                {error && !loading && (
                    <div className="info-block error">{error}</div>
                )}

                {!loading && !error && items.length === 0 && (
                    <div className="info-block">Ничего не найдено</div>
                )}

                {!loading &&
                    !error &&
                    items.map((article) => (
                        <ArticleCard
                            key={article.id}
                            article={article}
                            onOpenProvider={handleOpenProvider}
                        />
                    ))}

                {!loading && !error && totalPages > 1 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        onChange={(newPage) => loadData(newPage)}
                    />
                )}
            </section>

            {/* попап с фильтрами */}
            {isFiltersOpen && (
                <div
                    className="articles-filters-modal__backdrop"
                    onClick={() => setIsFiltersOpen(false)}
                >
                    <div
                        className="articles-filters-modal"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="articles-filters-modal__header">
                            <h2>Фильтры</h2>
                            <button
                                type="button"
                                className="articles-filters-modal__close"
                                onClick={() => setIsFiltersOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="articles-filters-modal__body">
                            <ArticleFilters
                                {...filters}
                                onChange={handleChangeFilter}
                                // сбрасываем и сразу подгружаем, попап закрываем
                                onReset={() => {
                                    handleResetFilters();
                                    setIsFiltersOpen(false);
                                }}
                                // применяем и закрываем
                                onApply={handleApplyFilters}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ArticlesPage;
