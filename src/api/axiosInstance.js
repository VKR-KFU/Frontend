import axios from "axios";
import { toastError } from "../toast/toastBus";

export const apiClient = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

export const authorizedApiClient = axios.create({
    baseURL: "/api",
    headers: { "Content-Type": "application/json" },
});

export const statisticApiClient = axios.create({
    baseURL: "/statistic",
    headers: { "Content-Type": "application/json" },
})

authorizedApiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

authorizedApiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const data = error?.response?.data;

        const backendMessage =
            data?.error ||
            data?.message ||
            (typeof data === "string" ? data : null);

        toastError(backendMessage || (status ? `Ошибка ${status}` : "Ошибка сети/сервера"));
        return Promise.reject(error);
    }
);

export default apiClient;
