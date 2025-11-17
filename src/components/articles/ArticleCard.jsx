import React, { useState } from "react";
import "./ArticleCard.css";

function ArticleCard({ article, onOpenProvider }) {
    const {
        title,
        year,
        authors,
        articleDetails,
        providers = [],
        hasPdf, // твой bool с бэка
    } = article;

    const [isOpen, setIsOpen] = useState(false);

    const hasAuthors =
        Array.isArray(authors) && authors.length > 0;

    const hasTags = !!(
        articleDetails?.source ||
        articleDetails?.publicationType ||
        articleDetails?.language
    );

    const firstAuthor = authors?.[0];
    const otherAuthorsCount = Math.max(0, (authors?.length ?? 0) - 1);

    const handleCardClick = () => {
        setIsOpen((prev) => !prev);
    };

    const handleProviderClick = (e, provider, index) => {
        e.stopPropagation();
        if (onOpenProvider) {
            onOpenProvider(article.id, provider.id ?? index, provider);
        }
    };

    return (
        <article className="article-card" onClick={handleCardClick}>
            <div className="article-card__header">
                <h3 className="article-card__title">{title}</h3>

                <div className="article-card__header-right">
                    {year && (
                        <span className="article-card__year">
                            {year}
                        </span>
                    )}

                    <span
                        className={
                            "article-card__caret" +
                            (isOpen ? " article-card__caret--open" : "")
                        }
                    >
                        ▾
                    </span>
                </div>
            </div>

            {(hasAuthors || articleDetails?.universityName || !hasAuthors) && (
                <div className="article-card__meta">
                    <span
                        className={
                            hasAuthors
                                ? "article-card__author"
                                : "article-card__author article-card__author--missing"
                        }
                    >
                        {hasAuthors ? (
                            <>
                                Авторы {firstAuthor.fullName}
                                {otherAuthorsCount > 0 &&
                                    ` и ещё ${otherAuthorsCount}`}
                            </>
                        ) : (
                            "Автор не указан"
                        )}
                    </span>

                    {articleDetails?.universityName && (
                        <>
                            <span className="article-card__dot" />
                            <span className="article-card__university">
                                {articleDetails.universityName}
                            </span>
                        </>
                    )}

                    {typeof hasPdf === "boolean" && (
                        <>
                            <span className="article-card__dot" />
                            <span
                                className={
                                    "article-card__pdf-flag" +
                                    (hasPdf
                                        ? " article-card__pdf-flag--ok"
                                        : " article-card__pdf-flag--no")
                                }
                            >
                                {hasPdf ? "PDF доступен" : "PDF не доступен"}
                            </span>
                        </>
                    )}
                </div>
            )}

            {/* раскрывающийся блок с источниками */}
            {providers.length > 0 && (
                <div
                    className={
                        "article-card__providers-wrapper" +
                        (isOpen ? " article-card__providers-wrapper--open" : "")
                    }
                >
                    <div className="article-card__providers">
                        {providers.map((p, index) => (
                            <button
                                key={p.id ?? index}
                                type="button"
                                className="provider-tile"
                                onClick={(e) =>
                                    handleProviderClick(e, p, index)
                                }
                            >
                                <div className="provider-tile__header">
                                    <span className="provider-tile__name">
                                        {p.source || `Источник ${index + 1}`}
                                    </span>
                                    {p.language && (
                                        <span className="provider-tile__lang">
                                            {p.language.toUpperCase()}
                                        </span>
                                    )}
                                </div>

                                <div className="provider-tile__meta">
                                    {p.year && (
                                        <span className="provider-tile__meta-item">
                                            {p.year}
                                        </span>
                                    )}

                                    {p.publicationType && (
                                        <span className="provider-tile__meta-item">
                                            {p.publicationType}
                                        </span>
                                    )}

                                    <span
                                        className={
                                            "provider-tile__pdf" +
                                            (p.pdfUrl
                                                ? " provider-tile__pdf--ok"
                                                : " provider-tile__pdf--no")
                                        }
                                    >
                                        {p.pdfUrl ? "PDF" : "PDF нет"}
                                    </span>
                                </div>

                                {p.altmetric && (
                                    <div className="provider-tile__stats">
                                        <span>
                                            Просмотры:{" "}
                                            {p.altmetric.views ?? 0}
                                        </span>
                                        <span>
                                            Скачивания:{" "}
                                            {p.altmetric.countDownloaded ?? 0}
                                        </span>
                                        <span>
                                            Цитирования (РИНЦ):{" "}
                                            {p.citirovanieInRinc ?? 0}
                                        </span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}

export default ArticleCard;
