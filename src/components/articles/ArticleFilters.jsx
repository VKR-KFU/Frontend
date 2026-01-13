import React, { useEffect, useState } from "react";
import { getFilters } from "../../api/articleApi";

export default function ArticleFilters(props) {
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

    const [options, setOptions] = useState({
        publicationTypes: [],
        languages: [],
        oecdCodes: [],
        asjcCodes: [],
        vakCodes: [],
        years: [],
    });

    const [filtersLoading, setFiltersLoading] = useState(false);
    const [filtersError, setFiltersError] = useState(null);

    useEffect(() => {
        const loadFilters = async () => {
            try {
                setFiltersLoading(true);
                setFiltersError(null);

                const response = await getFilters();
                const data = response.data ?? {};

                setOptions({
                    publicationTypes: data.publications ?? [],
                    languages: data.languages ?? [],
                    oecdCodes: data.oecdCodes ?? [],
                    asjcCodes: data.asjcCodes ?? [],
                    vakCodes: data.vakCodes ?? [],
                    years: data.years ?? [],
                });
            } catch (err) {
                console.error("Ошибка загрузки фильтров", err);
                setFiltersError("Не удалось загрузить справочники фильтров");
            } finally {
                setFiltersLoading(false);
            }
        };

        loadFilters();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ошибка загрузки справочников */}
            {filtersError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                    {filtersError}
                </div>
            )}

            {/* 1) Автор */}
            <Section title="Автор">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="ФИО автора">
                        <Input
                            value={authorName}
                            onChange={(e) => onChange("authorName", e.target.value)}
                        />
                    </Field>

                    <Field label="SPIN-код">
                        <Input
                            value={authorSpin}
                            onChange={(e) => onChange("authorSpin", e.target.value)}
                        />
                    </Field>

                    <Field label="Организация">
                        <Input
                            value={authorOrg}
                            onChange={(e) => onChange("authorOrg", e.target.value)}
                        />
                    </Field>

                    <Field label="Факультет / кафедра">
                        <Input
                            value={authorDepartment}
                            onChange={(e) => onChange("authorDepartment", e.target.value)}
                        />
                    </Field>
                </div>
            </Section>

            {/* 2) Публикация */}
            <Section title="Публикация">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Год">
                        <Select
                            value={year || ""}
                            disabled={filtersLoading}
                            onChange={(e) => onChange("year", e.target.value)}
                        >
                            <option value="">Любой год</option>
                            {options.years.map((y) => (
                                <option key={y} value={y}>
                                    {y}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Источник">
                        <Select
                            value={source || ""}
                            onChange={(e) => onChange("source", e.target.value)}
                        >
                            <option value="">Любой источник</option>
                            <option value="ELibrary">eLibrary</option>
                            <option value="CyberLenin">CyberLenin</option>
                        </Select>
                    </Field>

                    <Field label="Тип публикации">
                        <Select
                            value={publicationType || ""}
                            disabled={filtersLoading}
                            onChange={(e) => onChange("publicationType", e.target.value)}
                        >
                            <option value="">Не важно</option>
                            {options.publicationTypes.map((pt) => (
                                <option key={pt} value={pt}>
                                    {pt}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Язык">
                        <Select
                            value={language || ""}
                            disabled={filtersLoading}
                            onChange={(e) => onChange("language", e.target.value)}
                        >
                            <option value="">Не важно</option>
                            {options.languages.map((lang) => (
                                <option key={lang} value={lang}>
                                    {lang}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Университет">
                        <Input
                            value={universityName}
                            onChange={(e) => onChange("universityName", e.target.value)}
                        />
                    </Field>

                    <Field label="EDN">
                        <Input value={edn} onChange={(e) => onChange("edn", e.target.value)} />
                    </Field>
                </div>
            </Section>

            {/* 3) Аннотации и ключевые слова */}
            <Section title="Аннотации и ключевые слова">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Текст русской аннотации содержит">
                        <Input
                            placeholder="фраза из abstractRu"
                            value={abstractRuText}
                            onChange={(e) => onChange("abstractRuText", e.target.value)}
                        />
                    </Field>

                    <Field label="Текст английской аннотации содержит">
                        <Input
                            placeholder="фраза из abstractEn"
                            value={abstractEnText}
                            onChange={(e) => onChange("abstractEnText", e.target.value)}
                        />
                    </Field>

                    <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
                        <Checkbox
                            checked={hasAbstractRu}
                            onChange={(e) => onChange("hasAbstractRu", e.target.checked)}
                            label="Только с русской аннотацией"
                        />
                        <Checkbox
                            checked={hasAbstractEn}
                            onChange={(e) => onChange("hasAbstractEn", e.target.checked)}
                            label="Только с английской аннотацией"
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <Field label="Ключевые слова (через запятую)">
                            <Input
                                placeholder="NLP, поиск, Kafka..."
                                value={
                                    Array.isArray(keywordsText)
                                        ? keywordsText.join(", ")
                                        : keywordsText || ""
                                }
                                onChange={(e) =>
                                    onChange(
                                        "keywordsText",
                                        e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean)
                                    )
                                }
                            />
                        </Field>
                    </div>
                </div>
            </Section>

            {/* 4) Индексация и классификация */}
            <Section title="Индексация и классификация">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2 flex flex-col sm:flex-row gap-3 pt-1">
                        <Checkbox
                            checked={isRinc}
                            onChange={(e) => onChange("isRinc", e.target.checked)}
                            label="Только РИНЦ"
                        />
                        <Checkbox
                            checked={isCoreRinc}
                            onChange={(e) => onChange("isCoreRinc", e.target.checked)}
                            label="Только ядро РИНЦ"
                        />
                    </div>

                    <Field label="OECD code">
                        <Select
                            value={oecdCodeName || ""}
                            disabled={filtersLoading}
                            onChange={(e) => onChange("oecdCodeName", e.target.value)}
                        >
                            <option value="">Не важно</option>
                            {options.oecdCodes.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="ASJC code">
                        <Select
                            value={asjcCodeName || ""}
                            disabled={filtersLoading}
                            onChange={(e) => onChange("asjcCodeName", e.target.value)}
                        >
                            <option value="">Не важно</option>
                            {options.asjcCodes.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="ВАК">
                        <Select
                            value={vakCodeName || ""}
                            disabled={filtersLoading}
                            onChange={(e) => onChange("vakCodeName", e.target.value)}
                        >
                            <option value="">Не важно</option>
                            {options.vakCodes.map((code) => (
                                <option key={code} value={code}>
                                    {code}
                                </option>
                            ))}
                        </Select>
                    </Field>

                    <Field label="Patents holders">
                        <Input
                            value={patents}
                            onChange={(e) => onChange("patents", e.target.value)}
                        />
                    </Field>
                </div>
            </Section>

            {/* 5) Метрики */}
            <Section title="Метрики">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Field label="Минимум просмотров">
                        <Input
                            type="number"
                            value={minViews}
                            onChange={(e) => onChange("minViews", e.target.value)}
                        />
                    </Field>

                    <Field label="Мин. цитирований в РИНЦ">
                        <Input
                            type="number"
                            value={minCitationsRinc}
                            onChange={(e) => onChange("minCitationsRinc", e.target.value)}
                        />
                    </Field>

                    <Field label="Мин. цитирований в Core РИНЦ">
                        <Input
                            type="number"
                            value={minCitirovanieInCoreRinc}
                            onChange={(e) =>
                                onChange("minCitirovanieInCoreRinc", e.target.value)
                            }
                        />
                    </Field>
                </div>
            </Section>

            {/* 6) Альтметрики */}
            <Section title="Альтметрики">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    <Field label="Altmetric score (мин.)">
                        <Input
                            type="number"
                            min="0"
                            value={altmetricAllScoreMin}
                            onChange={(e) => onChange("altmetricAllScoreMin", e.target.value)}
                        />
                    </Field>

                    <Field label="Просмотры (мин.)">
                        <Input
                            type="number"
                            min="0"
                            value={altmetricViewsMin}
                            onChange={(e) => onChange("altmetricViewsMin", e.target.value)}
                        />
                    </Field>

                    <Field label="Скачивания (мин.)">
                        <Input
                            type="number"
                            min="0"
                            value={altmetricDownloadsMin}
                            onChange={(e) =>
                                onChange("altmetricDownloadsMin", e.target.value)
                            }
                        />
                    </Field>

                    <Field label="Включений в коллекции (мин.)">
                        <Input
                            type="number"
                            min="0"
                            value={altmetricIncludedInCollectionsMin}
                            onChange={(e) =>
                                onChange("altmetricIncludedInCollectionsMin", e.target.value)
                            }
                        />
                    </Field>

                    <Field label="Рецензии / отзывы (мин.)">
                        <Input
                            type="number"
                            min="0"
                            value={altmetricTotalReviewsMin}
                            onChange={(e) =>
                                onChange("altmetricTotalReviewsMin", e.target.value)
                            }
                        />
                    </Field>
                </div>
            </Section>

            {/* Кнопки */}
            <div className="flex flex-col sm:flex-row gap-2 sm:justify-end pt-2">
                <button
                    type="button"
                    onClick={onReset}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                >
                    Сбросить
                </button>

                <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
                >
                    Применить
                </button>
            </div>
        </form>
    );
}

/* ---------------- UI primitives ---------------- */

function Section({ title, children }) {
    return (
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="p-5">
                <div className="text-base font-semibold text-slate-900">{title}</div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <div className="text-xs text-slate-600">{label}</div>
            <div className="mt-1">{children}</div>
        </label>
    );
}

function Input(props) {
    return (
        <input
            {...props}
            className={
                "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none " +
                "focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
            }
        />
    );
}

function Select(props) {
    return (
        <select
            {...props}
            className={
                "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none " +
                "focus:ring-2 focus:ring-slate-300 disabled:opacity-60"
            }
        />
    );
}

function Checkbox({ checked, onChange, label }) {
    return (
        <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="h-4 w-4 rounded border-slate-300"
            />
            <span>{label}</span>
        </label>
    );
}
