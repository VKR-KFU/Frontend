import apiClient from "./axiosInstance";

export async function getAuthor(authorId) {
    const r = await apiClient.get(`/Author/${authorId}`);
    if (r.status !== 200)
        throw new Error("Failed to load author");

    return r.data;
}

export async function getAuthorPublications(authorId, params = {}) {
    const usp = new URLSearchParams(params);
    const r = await apiClient.get(
        `/Author/${authorId}/publications?${usp}`);

    if (r.status !== 200)
        throw new Error("Failed to load publications");

    return r.data;
}

export async function getAuthors({ query = "", page = 1, pageSize = 8 } = {}) {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const r = await apiClient.get(`/Author?${params.toString()}`);
    if (r.status !== 200) throw new Error("Failed to load authors");
    return r.data;
}