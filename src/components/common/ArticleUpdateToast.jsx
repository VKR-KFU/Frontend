import React, { useEffect } from "react";
import "./css/ArticleUpdateToast.css";

function ArticleUpdateToast({ id, title, onClick, onClose, duration = 7000 }) {
    useEffect(() => {
        if (!duration) return;
        const timer = setTimeout(() => {
            onClose?.(id);
        }, duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <div
            className="article-toast"
            onClick={() => {
                onClick?.(id);
                onClose?.(id);
            }}
        >
            <div className="article-toast__icon">🔔</div>
            <div className="article-toast__content">
                <div className="article-toast__title">
                    Статья обновлена
                </div>
                <div className="article-toast__text">
                    {title || "Нажмите, чтобы открыть подробности"}
                </div>
            </div>
            <button
                type="button"
                className="article-toast__close"
                onClick={(e) => {
                    e.stopPropagation();
                    onClose?.(id);
                }}
            >
                ×
            </button>
        </div>
    );
}

export default ArticleUpdateToast;
