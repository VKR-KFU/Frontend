import React from "react";
import { X } from "lucide-react";

export default function ErrorToastContainer({ toasts, onClose }) {
    return (
        <div className="fixed right-4 top-4 z-[100] space-y-2 w-[360px] max-w-[calc(100vw-2rem)]">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className="rounded-2xl bg-white shadow-lg ring-1 ring-black/10 p-4"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900">
                                {t.title}
                            </div>
                            {t.details ? (
                                <div className="mt-1 text-sm text-slate-600 break-words">
                                    {t.details}
                                </div>
                            ) : null}
                        </div>

                        <button
                            className="rounded-xl p-2 hover:bg-slate-100"
                            onClick={() => onClose(t.id)}
                            aria-label="Закрыть"
                        >
                            <X className="h-4 w-4 text-slate-700" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
