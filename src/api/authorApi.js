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