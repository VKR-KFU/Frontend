import {authorizedApiClient} from "./axiosInstance";
import {toastError} from "../toast/toastBus";

export default async function getMe() {
    try {
        const r = await authorizedApiClient.get("/User/me");
        const res = r.data;

        // Если бэк возвращает Result<T> (camelCase)
        if (res?.isSuccess === false) throw new Error(res?.error || "Ошибка");
        if (res?.value) return res.value;

        // Если бэк возвращает Result<T> (PascalCase)
        if (res?.IsSuccess === false) throw new Error(res?.Error || "Ошибка");
        if (res?.Value) return res.Value;

        // Если бэк вернул сразу DTO
        return res;
    } catch (e) {
        if (e?.response?.status === 401) return null;
        throw e;
    }
}