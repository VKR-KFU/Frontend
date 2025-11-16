import React from "react";

function ArticleSearchBar({ title, onChangeTitle, onSearch }) {
    return (
        <div className="search-bar">
            <div className="header-title">Поиск статей</div>
            <div className="search-row">
                <input
                    className="input-text"
                    placeholder="Название статьи"
                    value={title}
                    onChange={(e) => onChangeTitle(e.target.value)}
                />
                <button className="btn btn-primary" onClick={onSearch}>
                    Найти
                </button>
            </div>
        </div>
    );
}

export default ArticleSearchBar;
