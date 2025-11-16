import React from "react";

function ArticleFilters({
                            authorName,
                            authorOrg,
                            authorDepartment,
                            authorSpin,
                            year,
                            source,
                            universityName,
                            publicationType,
                            language,
                            onChange,
                            onReset,
                            onApply,
                        }) {
    return (
        <aside className="filters">
            <div className="filters-header">
                <div className="filters-title">Фильтры</div>
                <button className="filters-reset" onClick={onReset}>
                    Сбросить
                </button>
            </div>

            <div className="filter-group">
                <div className="filter-group-title">Авторы</div>

                <label className="filter-label">
                    <span>ФИО</span>
                    <input
                        className="input-text input-text-sm"
                        value={authorName}
                        onChange={(e) => onChange("authorName", e.target.value)}
                    />
                </label>

                <label className="filter-label">
                    <span>Организация</span>
                    <input
                        className="input-text input-text-sm"
                        value={authorOrg}
                        onChange={(e) => onChange("authorOrg", e.target.value)}
                    />
                </label>

                <label className="filter-label">
                    <span>Подразделение</span>
                    <input
                        className="input-text input-text-sm"
                        value={authorDepartment}
                        onChange={(e) => onChange("authorDepartment", e.target.value)}
                    />
                </label>

                <label className="filter-label">
                    <span>SPIN-код</span>
                    <input
                        className="input-text input-text-sm"
                        value={authorSpin}
                        onChange={(e) => onChange("authorSpin", e.target.value)}
                    />
                </label>
            </div>

            <div className="filter-group">
                <div className="filter-group-title">Детали статьи</div>

                <label className="filter-label">
                    <span>Год</span>
                    <input
                        className="input-text input-text-sm"
                        type="number"
                        value={year}
                        onChange={(e) => onChange("year", e.target.value)}
                    />
                </label>

                <label className="filter-label">
                    <span>Источник (eLibrary, CyberLenin)</span>
                    <input
                        className="input-text input-text-sm"
                        value={source}
                        onChange={(e) => onChange("source", e.target.value)}
                    />
                </label>

                <label className="filter-label">
                    <span>Университет</span>
                    <input
                        className="input-text input-text-sm"
                        value={universityName}
                        onChange={(e) => onChange("universityName", e.target.value)}
                    />
                </label>

                <label className="filter-label">
                    <span>Тип публикации</span>
                    <input
                        className="input-text input-text-sm"
                        value={publicationType}
                        onChange={(e) => onChange("publicationType", e.target.value)}
                    />
                </label>

                <label className="filter-label">
                    <span>Язык (ru / en)</span>
                    <input
                        className="input-text input-text-sm"
                        value={language}
                        onChange={(e) => onChange("language", e.target.value)}
                    />
                </label>
            </div>

            <button className="btn btn-primary btn-full" onClick={onApply}>
                Применить фильтры
            </button>
        </aside>
    );
}

export default ArticleFilters;
