import {statisticApiClient} from "./axiosInstance";

// 1) totals по статье
export function getArticleDetailStatistic(articleId) {
    return statisticApiClient.get(`/Statistic/${articleId}`).then((res) => res.data);
}

// 2) timeseries по статье
// GET /api/Statistic/{articleId}/timeseries?from=2026-02-01&to=2026-02-10
export function getArticleStatisticTimeseries(articleId, { from, to } = {}) {
    return statisticApiClient
        .get(`/Statistic/${articleId}/timeseries`, {
            params: {
                from: from || undefined,
                to: to || undefined,
            },
        })
        .then((res) => res.data);
}

// 3) TOP для sidebar
// GET /api/Statistic/top?metric=views&period=7d&limit=5
export function getTopArticlesStatistic({ metric = "views", period = "7d", limit = 5 } = {}) {
    return statisticApiClient
        .get(`/Statistic/top`, {
            params: {
                metric,
                period,
                limit,
            },
        })
        .then((res) => res.data);
}