import React from "react";
import './ArticleCard.css';

function ArticleCard({ article }) {
    const {
        title,
        year,
        authors,
        articleDetails,
    } = article;

    const hasAuthors = Array.isArray(article.authors) && article.authors.length > 0;
    const hasTags = !!(articleDetails?.source ||
            articleDetails?.publicationType ||
            articleDetails?.language);

    const firstAuthor = authors?.[0];
    const otherAuthorsCount = Math.max(0, (authors?.length ?? 0) - 1);

    return (
        <article className="article-card">
            <div className="article-card__header">
                <h3 className="article-card__title">{title}</h3>

                {year && (
                    <span className="article-card__year">
                        {year}
                    </span>
                )}
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
                    {hasAuthors
                        ? <>
                            Авторы {firstAuthor.fullName}
                            {otherAuthorsCount > 0 && ` и ещё ${otherAuthorsCount}`}
                        </>
                        : "Автор не указан"}
                </span>

                    {articleDetails?.universityName && (
                        <>
                            <span className="article-card__dot" />
                            <span className="article-card__university">
                    {articleDetails.universityName}
                            </span>
                        </>
                    )}
                </div>
            )}

            <div className="article-card__tags">
                {hasTags ? (
                    <>
                        {articleDetails?.source && (
                            <span className="article-card__tag">
                                {articleDetails.source}
                            </span>
                        )}

                        {articleDetails?.publicationType && (
                            <span className="article-card__tag article-card__tag--secondary">
                    {articleDetails.publicationType}
                            </span>
                        )}

                        {articleDetails?.language && (
                            <span className="article-card__tag article-card__tag--ghost">
                    {articleDetails.language.toUpperCase()}
                            </span>
                        )}
                    </>
                ) : (
                    <span className="article-card__tag article-card__tag--empty">
                        Детали публикации не указаны
                    </span>
                )}
            </div>
        </article>
    );
}

export default ArticleCard;
