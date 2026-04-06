let handler = null;

export function setToastHandler(fn) {
    handler = fn;
}

export function toastError(message, details) {
    if (!handler) return;
    handler({
        type: "error",
        title: message || "Ошибка",
        details,
    });
}

export function toastSuccess(message) {
    if (!handler) return;
    handler({
        type: "success",
        title: message || "Готово",
    });
}
