import React, { useEffect, useMemo, useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import {approveClaim, ClaimStatus, getClaims, rejectClaim} from "../api/authorVerify";

const statusOptions = [
    { value: ClaimStatus.All, label: "Все" },
    { value: ClaimStatus.Pending, label: "Ожидают" },
    { value: ClaimStatus.Approved, label: "Одобрены" },
    { value: ClaimStatus.Rejected, label: "Отклонены" },
];

export default function AdminClaimsPage() {
    const [status, setStatus] = useState(ClaimStatus.All);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState("");

    const load = async (s = status) => {
        setLoading(true);
        setError("");
        try {
            const list = await getClaims(s);
            setItems(list || []);
        } catch (e) {
            setError(e?.message || "Не удалось загрузить заявки");
            setItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(status);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    const pendingOnly = useMemo(() => status === ClaimStatus.Pending || status === ClaimStatus.All, [status]);

    const onApprove = async (id) => {
        setBusyId(id);
        setError("");
        try {
            await approveClaim(id);
            // после действия можно просто убрать из списка, если смотрим pending
            if (status === ClaimStatus.Pending) {
                setItems((prev) => prev.filter((x) => x.id !== id));
            } else {
                await load(status);
            }
        } catch (e) {
            setError(e?.message || "Не удалось подтвердить");
        } finally {
            setBusyId(null);
        }
    };

    const onReject = async (id) => {
        const reason = window.prompt("Причина отказа (необязательно):", "") ?? "";
        setBusyId(id);
        setError("");
        try {
            await rejectClaim(id, reason);
            if (status === ClaimStatus.Pending) {
                setItems((prev) => prev.filter((x) => x.id !== id));
            } else {
                await load(status);
            }
        } catch (e) {
            setError(e?.message || "Не удалось отклонить");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-10 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                    <div className="text-2xl font-semibold text-slate-900">Заявки на подтверждение автора</div>
                    <div className="text-sm text-slate-600">Просмотр + approve/reject</div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <select
                        value={status}
                        onChange={(e) => setStatus(Number(e.target.value))}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-300"
                    >
                        {statusOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => load(status)}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Обновить
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>
            )}

            {loading ? (
                <div className="rounded-2xl bg-white ring-1 ring-black/5 p-6 text-sm text-slate-600">Загрузка…</div>
            ) : items.length === 0 ? (
                <div className="rounded-2xl bg-white ring-1 ring-black/5 p-10 text-center">
                    <div className="text-lg font-semibold text-slate-900">Нет заявок</div>
                    <div className="mt-1 text-sm text-slate-600">По выбранному статусу ничего не найдено.</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((c) => (
                        <div key={c.id} className="rounded-2xl bg-white ring-1 ring-black/5 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="text-sm text-slate-500">ID: {c.id}</div>
                                    <div className="mt-1 text-base font-semibold text-slate-900">
                                        AuthorId: {c.authorId}
                                    </div>

                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-700">
                                        <div>
                                            <span className="text-slate-500">Email: </span>
                                            {c.email || "—"}
                                        </div>
                                        <div>
                                            <span className="text-slate-500">Телефон: </span>
                                            {c.phone || "—"}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <span className="text-slate-500">Evidence: </span>
                                            {c.edviceLink ? (
                                                <a className="text-slate-900 underline" href={c.edviceLink} target="_blank" rel="noreferrer">
                                                    {c.edviceLink}
                                                </a>
                                            ) : (
                                                "—"
                                            )}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <span className="text-slate-500">Комментарий: </span>
                                            {c.comment || "—"}
                                        </div>

                                        <div className="sm:col-span-2">
                                            <span className="text-slate-500">Статус: </span>
                                            <span className="font-semibold text-slate-900">{c.status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* кнопки показываем только когда это имеет смысл */}
                                <div className="flex flex-wrap gap-2">
                                    {pendingOnly && c.status === "Pending" ? (
                                        <>
                                            <button
                                                onClick={() => onApprove(c.id)}
                                                disabled={busyId === c.id}
                                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                                            >
                                                <Check className="h-4 w-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => onReject(c.id)}
                                                disabled={busyId === c.id}
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
                                            >
                                                <X className="h-4 w-4" />
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-xs text-slate-500 self-center">Действия доступны только для Pending</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
