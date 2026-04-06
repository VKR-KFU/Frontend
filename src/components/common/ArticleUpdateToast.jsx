import React, { useEffect } from "react";
import { Bell, X } from "lucide-react";

function ArticleUpdateToast({ id, title, onClick, onClose, duration = 7000 }) {
    useEffect(() => {
        if (!duration) return;
        const timer = setTimeout(() => onClose?.(id), duration);
        return () => clearTimeout(timer);
    }, [id, duration, onClose]);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => {
                onClick?.(id);
                onClose?.(id);
            }}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    onClick?.(id);
                    onClose?.(id);
                }
            }}
            className="
        w-full max-w-md cursor-pointer
        rounded-2xl bg-white shadow-lg ring-1 ring-black/10
        hover:shadow-xl transition
        px-4 py-3
      "
        >
            <div className="flex items-start gap-3">
                {/* icon */}
                <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-2xl bg-slate-100 ring-1 ring-black/5">
                    <Bell className="h-5 w-5 text-slate-700" />
                </div>

                {/* content */}
                <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-900">
                        Статья обновлена
                    </div>
                    <div className="mt-1 text-sm text-slate-600 truncate">
                        {title || "Нажмите, чтобы открыть подробности"}
                    </div>

                    {/* small hint */}
                    <div className="mt-2 inline-flex items-center rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
                        Кликните, чтобы открыть
                    </div>
                </div>

                {/* close */}
                <button
                    type="button"
                    aria-label="Закрыть"
                    className="
            -mr-1 -mt-1
            rounded-xl p-2
            text-slate-600 hover:bg-slate-100 hover:text-slate-900
          "
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose?.(id);
                    }}
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* progress bar (визуально, без таймера в css) */}
            {duration ? (
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                        className="h-full w-full origin-left scale-x-100 bg-slate-300"
                        style={{
                            animation: `toast-progress ${duration}ms linear forwards`,
                        }}
                    />
                </div>
            ) : null}

            {/* keyframes inline */}
            <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
        </div>
    );
}

export default ArticleUpdateToast;