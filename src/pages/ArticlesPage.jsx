import React, { useEffect, useState } from "react";
import { searchArticles } from "../api/articleApi";
import ArticleSearchBar from "../components/articles/ArticleSearchBar";
import ArticleFilters from "../components/articles/ArticleFilters";
import ArticleCard from "../components/articles/ArticleCard";
import Pagination from "../components/common/Pagination";
import "./ArticlesPage.css";

const PAGE_SIZE = 20;

const INITIAL_FILTERS = {
    authorName: "",
    authorOrg: "",
    authorDepartment: "",
    authorSpin: "",
    year: "",
    source: "",
    universityName: "",
    publicationType: "",
    language: "",
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
            articleDetails: {
                year: filters.year ? Number(filters.year) : undefined,
                source: filters.source || undefined,
                // по контракту у тебя UniersityName — с опечаткой
                uniersityName: filters.universityName || undefined,
                publicationType: filters.publicationType || undefined,
                ruAnnotation: undefined,
                enAnnotation: undefined,
                patents: undefined,
                edn: undefined,
                language: filters.language || undefined,
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
                    />
                </div>

                <button
                    type="button"
                    className="articles-page__filters-btn"
                    onClick={() => setIsFiltersOpen(true)}
                >
                    Фильтры
                </button>
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
                        <ArticleCard key={article.id} article={article} />
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
