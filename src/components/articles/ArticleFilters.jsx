import React from "react";

function ArticleFilters(props) {
    const {
        // автор
        authorName,
        authorOrg,
        authorDepartment,
        authorSpin,

        // публикация
        year,
        source,
        universityName,
        publicationType,
        language,
        edn,

        // аннотации и ключевые слова
        abstractRuText,
        abstractEnText,
        hasAbstractRu,
        hasAbstractEn,
        keywordsText,

        // индексация / классификация
        isRinc,
        isCoreRinc,
        oecdCodeName,
        asjcCodeName,
        vakCodeName,
        patents,

        // метрики
        minViews,
        minCitationsRinc,
        minCitirovanieInCoreRinc,

        // Альтметрики
        altmetricAllScoreMin,
        altmetricViewsMin,
        altmetricDownloadsMin,
        altmetricIncludedInCollectionsMin,
        altmetricTotalReviewsMin,

        onChange,
        onReset,
        onApply,
    } = props;

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply();
    };

    return (
        <form className="filters-form" onSubmit={handleSubmit}>
            {/* 1. Автор */}
            <section className="filters-section">
                <h3 className="filters-section__title">Автор</h3>

                <label className="filter-label">
                    <span>ФИО автора</span>
                    <input
                        className="input-text input-text-sm"
                        value={authorName}
                        onChange={(e) =>
                            onChange("authorName", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Организация</span>
                    <input
                        className="input-text input-text-sm"
                        value={authorOrg}
                        onChange={(e) =>
                            onChange("authorOrg", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Факультет / кафедра</span>
                    <input
                        className="input-text input-text-sm"
                        value={authorDepartment}
                        onChange={(e) =>
                            onChange("authorDepartment", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>SPIN-код</span>
                    <input
                        className="input-text input-text-sm"
                        value={authorSpin}
                        onChange={(e) =>
                            onChange("authorSpin", e.target.value)
                        }
                    />
                </label>
            </section>

            {/* 2. Публикация и источник */}
            <section className="filters-section">
                <h3 className="filters-section__title">Публикация</h3>

                <label className="filter-label">
                    <span>Год</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        value={year}
                        onChange={(e) => onChange("year", e.target.value)}
                    />
                </label>

                <label className="filter-label">
                    <span>Источник</span>
                    <select
                        className="input-text input-text-sm"
                        value={source || ""}
                        onChange={(e) => onChange("source", e.target.value)}
                    >
                        <option value="">Любой источник</option>
                        <option value="ELibrary">eLibrary</option>
                        <option value="CyberLenin">CyberLenin</option>
                    </select>
                </label>

                <label className="filter-label">
                    <span>Тип публикации</span>
                    <select
                        className="input-text input-text-sm"
                        value={publicationType}
                        onChange={(e) =>
                            onChange("publicationType", e.target.value)
                        }
                    >
                        <option value="">Не важно</option>
                        <option value="статья в журнале - научная статья">
                            Научная статья в журнале
                        </option>
                        <option value="статья в журнале">
                            Статья в журнале (другое)
                        </option>
                        {/* сюда потом добавишь реальные типы */}
                    </select>
                </label>

                <label className="filter-label">
                    <span>Университет</span>
                    <input
                        className="input-text input-text-sm"
                        value={universityName}
                        onChange={(e) =>
                            onChange("universityName", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Язык</span>
                    <select
                        className="input-text input-text-sm"
                        value={language}
                        onChange={(e) =>
                            onChange("language", e.target.value)
                        }
                    >
                        <option value="">Не важно</option>
                        <option value="русский">Русский</option>
                        <option value="английский">Английский</option>
                        <option value="киргизский">Киргизский</option>
                        {/* добавь при необходимости другие */}
                    </select>
                </label>
            </section>

            {/* 3. Аннотации и ключевые слова */}
            <section className="filters-section">
                <h3 className="filters-section__title">Аннотации и ключевые слова</h3>

                <label className="filter-label">
                    <span>Текст русской аннотации содержит</span>
                    <input
                        className="input-text input-text-sm"
                        placeholder="фраза из abstractRu"
                        value={abstractRuText}
                        onChange={(e) =>
                            onChange("abstractRuText", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Текст английской аннотации содержит</span>
                    <input
                        className="input-text input-text-sm"
                        placeholder="фраза из abstractEn"
                        value={abstractEnText}
                        onChange={(e) =>
                            onChange("abstractEnText", e.target.value)
                        }
                    />
                </label>

                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={hasAbstractRu}
                        onChange={(e) =>
                            onChange("hasAbstractRu", e.target.checked)
                        }
                    />
                    <span>Только с русской аннотацией</span>
                </label>

                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={hasAbstractEn}
                        onChange={(e) =>
                            onChange("hasAbstractEn", e.target.checked)
                        }
                    />
                    <span>Только с английской аннотацией</span>
                </label>

                <label className="filter-label">
                    <span>Ключевые слова</span>
                    <input
                        className="input-text input-text-sm"
                        placeholder="ОКУТУУ ПРОЦЕССИ, ПРЕДМЕТТЕР АРАЛЫК..."
                        value={keywordsText}
                        onChange={(e) =>
                            onChange(
                                "keywordsText",
                                e.target.value
                                    .split(",")              // режем по запятым
                                    .map((s) => s.trim())    // убираем пробелы
                                    .filter(Boolean)         // убираем пустые элементы
                            )
                        }
                    />
                </label>
            </section>

            {/* 4. Индексация и классификация */}
            <section className="filters-section">
                <h3 className="filters-section__title">Индексация и классификация</h3>

                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={isRinc}
                        onChange={(e) => onChange("isRinc", e.target.checked)}
                    />
                    <span>Только РИНЦ</span>
                </label>
                <div></div>
                <label className="filter-checkbox">
                    <input
                        type="checkbox"
                        checked={isCoreRinc}
                        onChange={(e) =>
                            onChange("isCoreRinc", e.target.checked)
                        }
                    />
                    <span>Только ядро РИНЦ</span>
                </label>

                <label className="filter-label">
                    <span>OECD code</span>
                    <input
                        className="input-text input-text-sm"
                        placeholder="Educational sciences"
                        value={oecdCodeName}
                        onChange={(e) =>
                            onChange("oecdCodeName", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>ASJC code</span>
                    <input
                        className="input-text input-text-sm"
                        value={asjcCodeName}
                        onChange={(e) =>
                            onChange("asjcCodeName", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>ВАК</span>
                    <input
                        className="input-text input-text-sm"
                        value={vakCodeName}
                        onChange={(e) =>
                            onChange("vakCodeName", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Edn</span>
                    <input
                        className="input-text input-text-sm"
                        value={edn}
                        onChange={(e) =>
                            onChange("edn", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Patents Holders</span>
                    <input
                        className="input-text input-text-sm"
                        value={patents}
                        onChange={(e) =>
                            onChange("patents", e.target.value)
                        }
                    />
                </label>
            </section>

            {/* 5. Метрики */}
            <section className="filters-section">
                <h3 className="filters-section__title">Метрики</h3>

                <label className="filter-label">
                    <span>Минимум просмотров</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        value={minViews}
                        onChange={(e) =>
                            onChange("minViews", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Минимум цитирований в РИНЦ</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        value={minCitationsRinc}
                        onChange={(e) =>
                            onChange("minCitationsRinc", e.target.value)
                        }
                    />
                </label>
                <label className="filter-label">
                    <span>Минимум цитирований в Core РИНЦ</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        value={minCitirovanieInCoreRinc}
                        onChange={(e) =>
                            onChange("minCitirovanieInCoreRinc", e.target.value)
                        }
                    />
                </label>
            </section>

            {/* 6. Альтметрики */}
            <section className="filters-section">
                <h3 className="filters-section__title">Альметрики</h3>

                <label className="filter-label">
                    <span>Altmetric score (мин.)</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        min="0"
                        value={altmetricAllScoreMin}
                        onChange={(e) =>
                            onChange("altmetricAllScoreMin", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Просмотры (мин.)</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        min="0"
                        value={altmetricViewsMin}
                        onChange={(e) =>
                            onChange("altmetricViewsMin", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Скачивания (мин.)</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        min="0"
                        value={altmetricDownloadsMin}
                        onChange={(e) =>
                            onChange("altmetricDownloadsMin", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Включений в коллекции (мин.)</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        min="0"
                        value={altmetricIncludedInCollectionsMin}
                        onChange={(e) =>
                            onChange("altmetricIncludedInCollectionsMin", e.target.value)
                        }
                    />
                </label>

                <label className="filter-label">
                    <span>Рецензии / отзывы (мин.)</span>
                    <input
                        type="number"
                        className="input-text input-text-sm"
                        min="0"
                        value={altmetricTotalReviewsMin}
                        onChange={(e) =>
                            onChange("altmetricTotalReviewsMin", e.target.value)
                        }
                    />
                </label>
            </section>

            {/* Кнопки */}
            <div className="filters-actions">
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onReset}
                >
                    Сбросить
                </button>
                <button type="submit" className="btn btn-primary">
                    Применить
                </button>
            </div>
        </form>
    );
}

export default ArticleFilters;
