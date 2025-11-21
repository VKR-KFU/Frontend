import apiClient from "./axiosInstance";

export function searchArticles(requestBody) {
    return apiClient.post("/Article", requestBody).then((res) => res.data);
}

export function getArticleById(id) {
    return apiClient.get(`/Article/${id}`).then((res) => res.data);
}

// filters api

export function publicationArticlesTypes() {
    return apiClient.get("/PublicationType")
}