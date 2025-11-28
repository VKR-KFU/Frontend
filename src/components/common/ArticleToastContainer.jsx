import React from "react";
import ArticleUpdateToast from "./ArticleUpdateToast";
import "./css/ArticleUpdateToast.css";

function ArticleToastContainer({ toasts, onToastClick, onToastClose }) {
    if (!toasts || !toasts.length) return null;

    return (
        <div className="article-toast-container">
            {toasts.map((t) => (
                <ArticleUpdateToast
                    key={t.id}
                    id={t.id}
                    title={t.title}
                    onClick={onToastClick}
                    onClose={onToastClose}
                />
            ))}
        </div>
    );
}

export default ArticleToastContainer;
