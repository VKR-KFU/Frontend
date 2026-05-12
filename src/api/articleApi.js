import apiClient from "./axiosInstance";

export function searchArticles(requestBody) {
    return apiClient.post("/Article", requestBody).then((res) => res.data);
}

export function getArticleById(id) {
    return apiClient.get(`/Article/${id}`).then((res) => res.data);
}

/** Похожие публикации (ключевые слова + pg_trgm). id — ArticleProvider. */
export function getSimilarArticles(providerId, limit = 10) {
    return apiClient
        .get(`/Article/${providerId}/similar`, { params: { limit } })
        .then((res) => res.data);
}

export function pdfDownloaded(id) {
    return apiClient.get(`/Article/${id}/pdf-clicked`).then((res) => res.data);
}

// filters api

export function getFilters() {
    return apiClient.get("/Filter")
}