import apiClient from "./axiosInstance";

export async function register(data) {
    const r = await apiClient.post(`/Auth/register`, data);

    const res = r.data;

    if (!res?.isSuccess) {
        throw new Error(res?.error || "Не удалось зарегистрироваться");
    }

    return res; // ок, без токена (у тебя RegisterAsync возвращает Result.Ok())
}

export async function login(data) {
    const r = await apiClient.post(`/Auth/login`, data);
    const res = r.data;

    if (!res?.isSuccess) {
        throw new Error(res?.error || "Не удалось войти");
    }

    if (!res?.value?.token) {
        throw new Error("Токен не пришёл с сервера");
    }

    return res.value;
}