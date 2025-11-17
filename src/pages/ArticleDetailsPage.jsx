import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getArticleById } from "../api/articleApi";
import "./ArticleDetailsPage.css";

function ArticleDetailsPage() {
    const { id } = useParams();

    const [article, setArticle] = useState(null);
    const [selectedProviderId, setSelectedProviderId] = useState(null);
    const [annotationTab, setAnnotationTab] = useState("ru");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!id) return;

        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await getArticleById(id);
                if (cancelled) return;

                setArticle(data || null);
                const firstProviderId = data?.providers?.[0]?.id ?? null;
                setSelectedProviderId(firstProviderId);
            } catch (e) {
                if (cancelled) return;
                setError(e.message || "Ошибка при загрузке статьи");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [id]);

    if (loading) {
        return (
            <div className="article-details">
                <div className="info-block">Загрузка…</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="article-details">
                <div className="info-block error">{error}</div>
            </div>
        );
    }

    if (!article) {
        return null;
    }

    const providers = article.providers || [];
    const selectedProvider =
        providers.find((p) => p.id === selectedProviderId) || providers[0] || {};

    const hasRuAnnotation = !!selectedProvider.abstractRu;
    const hasEnAnnotation = !!selectedProvider.abstractEn;

    const authors = article.authors || [];

    // поддержка двух форматов keywords:
    // 1) keywords: ["a", "b"]
    // 2) keywords: { text: ["a","b"], isEnglish: [true,false] }
    const keywordsText = Array.isArray(selectedProvider.keywords?.text)
        ? selectedProvider.keywords.text
        : Array.isArray(selectedProvider.keywords)
            ? selectedProvider.keywords
            : [];

    const keywordsIsEnglish = Array.isArray(selectedProvider.keywords?.isEnglish)
        ? selectedProvider.keywords.isEnglish
        : [];

    return (
        <div className="article-details">
            <header className="article-details__header">
                <button
                    type="button"
                    className="article-details__back"
                    onClick={() => window.history.back()}
                >
                    ← К списку статей
                </button>

                <div className="article-details__title-row">
                    <div className="article-details__title-block">
                        <h1 className="article-details__title">
                            {article.title}
                        </h1>
                        <div className="article-details__authors-line">
                            {authors.length > 0 ? (
                                authors.map((a) => a.fullName).join(", ")
                            ) : (
                                <span className="article-details__author-missing">
                                    Автор не указан
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="article-details__chips">
                        {selectedProvider.year && (
                            <span className="chip chip--year">
                                {selectedProvider.year}
                            </span>
                        )}
                        {selectedProvider.language && (
                            <span className="chip chip--lang">
                                {selectedProvider.language.toUpperCase()}
                            </span>
                        )}
                        {selectedProvider.source && (
                            <span className="chip chip--source">
                                {selectedProvider.source}
                            </span>
                        )}
                        <button
                            type="button"
                            className={
                                selectedProvider.pdfUrl
                                    ? "chip chip--pdf chip--pdf-ok"
                                    : "chip chip--pdf chip--pdf-missing"
                            }
                        >
                            {selectedProvider.pdfUrl
                                ? "PDF доступен"
                                : "PDF не доступен"}
                        </button>
                    </div>
                </div>
            </header>

            {providers.length > 1 && (
                <div className="article-details__providers-tabs">
                    <span className="article-details__providers-label">
                        Источники:
                    </span>
                    {providers.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => setSelectedProviderId(p.id)}
                            className={
                                p.id === selectedProviderId
                                    ? "providers-tab providers-tab--active"
                                    : "providers-tab"
                            }
                        >
                            {p.source}
                        </button>
                    ))}
                </div>
            )}

            <main className="article-details__body">
                {/* левая колонка */}
                <section className="article-details__col article-details__col--left">
                    <div className="card">
                        <h2 className="card__title">Авторы и организации</h2>
                        {authors.length === 0 && (
                            <p className="muted">Автор не указан.</p>
                        )}
                        {authors.length > 0 && (
                            <ul className="authors-list">
                                {authors.map((a, idx) => (
                                    <li key={idx} className="authors-list__item">
                                        <div className="authors-list__name">
                                            {a.fullName}
                                        </div>
                                        <div className="authors-list__meta">
                                            {a.department && <span>{a.department}</span>}
                                            {a.organization && (
                                                <>
                                                    {a.department && " • "}
                                                    <span>{a.organization}</span>
                                                </>
                                            )}
                                            {a.spinCode && (
                                                <>
                                                    {" "}
                                                    • SPIN: {a.spinCode}
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {selectedProvider.universityName && (
                            <p className="article-details__university">
                                Базовый вуз:{" "}
                                <strong>
                                    {selectedProvider.universityName}
                                </strong>
                            </p>
                        )}
                    </div>

                    <div className="card">
                        <div className="card__header-row">
                            <h2 className="card__title">Аннотация</h2>
                            <div className="tabs">
                                <button
                                    type="button"
                                    className={
                                        annotationTab === "ru"
                                            ? "tabs__btn tabs__btn--active"
                                            : "tabs__btn"
                                    }
                                    onClick={() => setAnnotationTab("ru")}
                                    disabled={!hasRuAnnotation}
                                >
                                    RU
                                </button>
                                <button
                                    type="button"
                                    className={
                                        annotationTab === "en"
                                            ? "tabs__btn tabs__btn--active"
                                            : "tabs__btn"
                                    }
                                    onClick={() => setAnnotationTab("en")}
                                    disabled={!hasEnAnnotation}
                                >
                                    EN
                                </button>
                            </div>
                        </div>

                        <div className="annotation">
                            {annotationTab === "ru" ? (
                                hasRuAnnotation ? (
                                    <p>{selectedProvider.abstractRu}</p>
                                ) : (
                                    <p className="muted">
                                        Русская аннотация в этом источнике не
                                        указана.
                                    </p>
                                )
                            ) : hasEnAnnotation ? (
                                <p>{selectedProvider.abstractEn}</p>
                            ) : (
                                <p className="muted">
                                    Английская аннотация в этом источнике не
                                    указана.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card__title">Ключевые слова</h2>
                        {keywordsText.length ? (
                            <div className="keywords">
                                {keywordsText.map((kw, idx) => {
                                    const isEng = keywordsIsEnglish[idx];
                                    return (
                                        <span
                                            key={idx}
                                            className="keyword-chip"
                                        >
                                            {kw}
                                            {typeof isEng === "boolean" && (
                                                <span className="keyword-chip__lang">
                                                    {isEng ? "EN" : "RU"}
                                                </span>
                                            )}
                                        </span>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="muted">
                                Ключевые слова не указаны.
                            </p>
                        )}
                    </div>
                </section>

                {/* правая колонка */}
                <section className="article-details__col article-details__col--right">
                    <div className="card">
                        <h2 className="card__title">
                            Библиографические данные
                        </h2>
                        <dl className="def-list">
                            <div className="def-list__row">
                                <dt>Источник</dt>
                                <dd>{selectedProvider.source || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>Тип публикации</dt>
                                <dd>
                                    {selectedProvider.publicationType || "—"}
                                </dd>
                            </div>
                            <div className="def-list__row">
                                <dt>Год</dt>
                                <dd>{selectedProvider.year || article.year || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>Университет</dt>
                                <dd>
                                    {selectedProvider.universityName || "—"}
                                </dd>
                            </div>
                            <div className="def-list__row">
                                <dt>ASJC</dt>
                                <dd>{selectedProvider.asjcCodeName || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>OECD</dt>
                                <dd>{selectedProvider.oecdCodeName || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>ВАК</dt>
                                <dd>{selectedProvider.vakCodeName || "—"}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="card">
                        <h2 className="card__title">Метрики</h2>
                        <div className="metrics-grid">
                            <div className="metric">
                                <div className="metric__label">Просмотры</div>
                                <div className="metric__value">
                                    {selectedProvider.altmetric?.views ?? 0}
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric__label">
                                    Скачивания
                                </div>
                                <div className="metric__value">
                                    {selectedProvider.altmetric
                                        ?.countDownloaded ?? 0}
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric__label">
                                    В коллекциях
                                </div>
                                <div className="metric__value">
                                    {selectedProvider.altmetric
                                        ?.includedInCollections ?? 0}
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric__label">Отзывы</div>
                                <div className="metric__value">
                                    {selectedProvider.altmetric?.totalReviews ??
                                        0}
                                </div>
                            </div>
                            <div className="metric metric--wide">
                                <div className="metric__label">
                                    Общий балл
                                </div>
                                <div className="metric__value">
                                    {selectedProvider.altmetric?.allScore ?? 0}
                                </div>
                            </div>
                        </div>

                        <div className="citations">
                            <div className="citations__item">
                                Цитирования (РИНЦ):{" "}
                                <strong>
                                    {selectedProvider.citirovanieInRinc ?? 0}
                                </strong>
                            </div>
                            <div className="citations__item">
                                Цитирования (ядро РИНЦ):{" "}
                                <strong>
                                    {selectedProvider.citirovanieInCoreRinc ??
                                        0}
                                </strong>
                            </div>
                            <div className="citations__badges">
                                {selectedProvider.isRinc && (
                                    <span className="badge badge--rinc">
                                        Входит в РИНЦ
                                    </span>
                                )}
                                {selectedProvider.isCoreRinc && (
                                    <span className="badge badge--core">
                                        Ядро РИНЦ
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card__title">Ссылки</h2>
                        <div className="links-row">
                            <a
                                href={selectedProvider.pdfUrl || undefined}
                                target="_blank"
                                rel="noreferrer"
                                className={
                                    selectedProvider.pdfUrl
                                        ? "btn btn--primary"
                                        : "btn btn--disabled"
                                }
                            >
                                Открыть PDF
                            </a>
                            <a
                                href={selectedProvider.sourceUrl || undefined}
                                target="_blank"
                                rel="noreferrer"
                                className={
                                    selectedProvider.sourceUrl
                                        ? "btn btn--ghost"
                                        : "btn btn--disabled"
                                }
                            >
                                Перейти к источнику
                            </a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default ArticleDetailsPage;
