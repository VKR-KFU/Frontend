import React from "react";
import './ArticleCard.css';

function ArticleCard({ article }) {
    const {
        title,
        year,
        authors,
        articleDetails,
    } = article;

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

            {(firstAuthor || articleDetails?.universityName) && (
                <div className="article-card__meta">
                    {firstAuthor && (
                        <span className="article-card__author">
                            Авторы {firstAuthor.fullName}
                            {otherAuthorsCount > 0 &&
                                ` и ещё ${otherAuthorsCount}`}
                        </span>
                    )}

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

            {(articleDetails?.source ||
                articleDetails?.publicationType ||
                articleDetails?.language) && (
                <div className="article-card__tags">
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
                </div>
            )}
        </article>
    );
}

export default ArticleCard;
