import React from "react";
import './ArticleSearchBar.css'

function ArticleSearchBar({ title, onChangeTitle, onSearch, onOpenFilters }) {
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

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={onOpenFilters}
                >
                    Фильтры
                </button>
            </div>
        </div>
    );
}

export default ArticleSearchBar;
