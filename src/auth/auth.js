export function getToken() {
    return localStorage.getItem("token");
}

export function isAuthed() {
    return !!getToken();
}

// простейший decode JWT (без проверки подписи — это нормально для UI)
export function decodeJwt(token) {
    try {
        const payload = token.split(".")[1];
        const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
        return null;
    }
}

export function getUserRole() {
    const token = getToken();
    if (!token) return null;
    const decoded = decodeJwt(token);
    const role =
        decoded?.role ||
        decoded?.["role"] ||
        decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    // иногда role может быть массивом
    if (Array.isArray(role)) return role[0] ?? null;
    return role ?? null;
}
