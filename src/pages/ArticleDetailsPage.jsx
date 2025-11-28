import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getArticleById } from "../api/articleApi";
import "./ArticleDetailsPage.css";

// добавь это (если путь другой — поправь)
import * as signalR from "@microsoft/signalr";
import {getSignalRConnection} from "../signalrConnection";

function ArticleDetailsPage() {
    const { id } = useParams();

    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [annotationTab, setAnnotationTab] = useState(null);
    const [annotationIndex, setAnnotationIndex] = useState(0);

    // состояние кнопки уведомлений
    const [notifySubscribed, setNotifySubscribed] = useState(false);
    const [notifyLoading, setNotifyLoading] = useState(false);

    // 1. загрузка статьи
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

    // 2. провайдер и аннотации — считаем КАЖДЫЙ рендер
    const provider = article?.provider ?? {};
    const annotations = Array.isArray(provider.annotations)
        ? provider.annotations
        : [];

    // 3. эффект для выбора активной вкладки аннотации
    useEffect(() => {
        if (!annotations.length) {
            setAnnotationIndex(0);
            return;
        }
        setAnnotationIndex(0);
    }, [article?.id, annotations.length]);

    const activeAnnotation = annotations[annotationIndex] || null;

    // 4. подписка на событие NotifyArticleUpdated (SignalR)
    useEffect(() => {
        const connection = getSignalRConnection();

        const handler = (payload) => {
            // payload.ArticleProviderId с сервера
            if (!provider.id || payload.articleProviderId !== provider.id) {
                return;
            }

            // получили нотификацию — перезагружаем статью
            getArticleById(id)
                .then((data) => setArticle(data || null))
                .catch((e) =>
                    console.error("Ошибка при обновлении статьи:", e)
                );
        };

        connection.on("NotifyArticleUpdated", handler);

        return () => {
            connection.off("NotifyArticleUpdated", handler);
        };
    }, [id, provider.id]);

    // 5. ранние выходы
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

    // 6. обычные вычисления после ранних return'ов
    const authors = article.authors || [];
    const isFull = !!provider.hasFull;

    const keywordsText = Array.isArray(provider.keywords)
        ? provider.keywords
        : [];

    const providerId = provider.id;

    const handleNotifyClick = async () => {
        if (!providerId) return;

        const connection = getSignalRConnection();

        try {
            setNotifyLoading(true);

            if (connection.state === signalR.HubConnectionState.Disconnected) {
                await connection.start();
                // eslint-disable-next-line no-console
                console.log("SignalR connected, id:", connection.connectionId);
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

                        {isFull ? (
                            <div className="article-details__notify article-details__notify--done">
                                Эта статья уже заполнена
                            </div>
                        ) : (
                            <button
                                type="button"
                                className={
                                    "notify-btn" +
                                    (notifySubscribed
                                        ? " notify-btn--active"
                                        : "") +
                                    (notifyLoading
                                        ? " notify-btn--loading"
                                        : "")
                                }
                                onClick={handleNotifyClick}
                                disabled={notifyLoading}
                            >
                                {notifyLoading
                                    ? "Подключаем уведомления…"
                                    : notifySubscribed
                                        ? "Уведомления включены"
                                        : "Уведомить, когда статья будет заполнена"}
                            </button>
                        )}
                    </div>

                    <div className="article-details__chips">
                        {(provider.year ?? article.year) && (
                            <span className="chip chip--year">
                                {provider.year ?? article.year}
                            </span>
                        )}
                        {provider.language && (
                            <span className="chip chip--lang">
                                {provider.language.toUpperCase()}
                            </span>
                        )}
                        {provider.source && (
                            <span className="chip chip--source">
                                {provider.source}
                            </span>
                        )}
                        <button
                            type="button"
                            className={
                                provider.pdfUrl
                                    ? "chip chip--pdf chip--pdf-ok"
                                    : "chip chip--pdf chip--pdf-missing"
                            }
                        >
                            {provider.pdfUrl
                                ? "PDF доступен"
                                : "PDF не доступен"}
                        </button>
                    </div>
                </div>
            </header>

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
                                    <li
                                        key={idx}
                                        className="authors-list__item"
                                    >
                                        <div className="authors-list__name">
                                            {a.fullName}
                                        </div>
                                        <div className="authors-list__meta">
                                            {a.department && (
                                                <span>{a.department}</span>
                                            )}
                                            {a.organization && (
                                                <>
                                                    {a.department && " • "}
                                                    <span>
                                                    {a.organization}
                                                </span>
                                                </>
                                            )}
                                            {a.spinCode && (
                                                <> • SPIN: {a.spinCode}</>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {provider.universityName && (
                            <p className="article-details__university">
                                Базовый вуз:{" "}
                                <strong>{provider.universityName}</strong>
                            </p>
                        )}
                    </div>

                    <div className="card">
                        <div className="card__header-row">
                            <h2 className="card__title">Аннотация</h2>

                            {annotations.length > 0 && (
                                <div className="tabs">
                                    {annotations.map((a, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            className={
                                                annotationIndex === idx
                                                    ? "tabs__btn tabs__btn--active"
                                                    : "tabs__btn"
                                            }
                                            onClick={() => setAnnotationIndex(idx)}
                                        >
                                            {a.displayName
                                                || a.languageCode?.toUpperCase()
                                                || `Аннотация ${idx + 1}`}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="annotation">
                            {annotations.length === 0 && (
                                <p className="muted">Аннотация не указана.</p>
                            )}

                            {annotations.length > 0 && activeAnnotation && (
                                <p>{activeAnnotation.text}</p>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h2 className="card__title">Ключевые слова</h2>
                        {keywordsText.length ? (
                            <div className="keywords">
                                {keywordsText.map((kw, idx) => (
                                    <span
                                        key={idx}
                                        className="keyword-chip"
                                    >
                                        {kw}
                                    </span>
                                ))}
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
                                <dd>{provider.source || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>Тип публикации</dt>
                                <dd>{provider.publicationType || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>Год</dt>
                                <dd>
                                    {provider.year ??
                                        article.year ??
                                        "—"}
                                </dd>
                            </div>
                            <div className="def-list__row">
                                <dt>Университет</dt>
                                <dd>{provider.universityName || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>ASJC</dt>
                                <dd>{provider.asjcCodeName || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>OECD</dt>
                                <dd>{provider.oecdCodeName || "—"}</dd>
                            </div>
                            <div className="def-list__row">
                                <dt>ВАК</dt>
                                <dd>{provider.vakCodeName || "—"}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="card">
                        <h2 className="card__title">Метрики</h2>
                        <div className="metrics-grid">
                            <div className="metric">
                                <div className="metric__label">Просмотры</div>
                                <div className="metric__value">
                                    {provider.altmetric?.views ?? 0}
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric__label">Скачивания</div>
                                <div className="metric__value">
                                    {provider.altmetric?.countDownloaded ?? 0}
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric__label">
                                    В коллекциях
                                </div>
                                <div className="metric__value">
                                    {provider.altmetric
                                        ?.includedInCollections ?? 0}
                                </div>
                            </div>
                            <div className="metric">
                                <div className="metric__label">Отзывы</div>
                                <div className="metric__value">
                                    {provider.altmetric?.totalReviews ?? 0}
                                </div>
                            </div>
                            <div className="metric metric--wide">
                                <div className="metric__label">
                                    Общий балл
                                </div>
                                <div className="metric__value">
                                    {provider.altmetric?.allScore ?? 0}
                                </div>
                            </div>
                        </div>

                        <div className="citations">
                            <div className="citations__item">
                                Цитирования (РИНЦ):{" "}
                                <strong>
                                    {provider.citirovanieInRinc ?? 0}
                                </strong>
                            </div>
                            <div className="citations__item">
                                Цитирования (ядро РИНЦ):{" "}
                                <strong>
                                    {provider.citirovanieInCoreRinc ?? 0}
                                </strong>
                            </div>
                            <div className="citations__badges">
                                {provider.isRinc && (
                                    <span className="badge badge--rinc">
                                        Входит в РИНЦ
                                    </span>
                                )}
                                {provider.isCoreRinc && (
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
                                href={provider.pdfUrl || undefined}
                                target="_blank"
                                rel="noreferrer"
                                className={
                                    provider.pdfUrl
                                        ? "btn btn--primary"
                                        : "btn btn--disabled"
                                }
                            >
                                Открыть PDF
                            </a>
                            <a
                                href={provider.sourceUrl || undefined}
                                target="_blank"
                                rel="noreferrer"
                                className={
                                    provider.sourceUrl
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
