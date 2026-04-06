import { authorizedApiClient } from "./axiosInstance";

export const ClaimStatus = {
    All: 1,
    Pending: 2,
    Rejected: 3,
    Approved: 4,
};

function unwrapResult(res) {
    const isSuccess = res?.isSuccess ?? res?.IsSuccess;
    const value = res?.value ?? res?.Value;
    const error = res?.error ?? res?.Error;

    if (isSuccess === false) {
        throw new Error(error || "Ошибка");
    }
    return value ?? res;
}

export async function getClaims(status = ClaimStatus.All) {
    const r = await authorizedApiClient.get("/AuthorVerify/get-claims", {
        params: { Status: status },
    });
    return unwrapResult(r.data);
}
export async function sendVerifyClaimAuthor(data) {
    const r = await authorizedApiClient.post(`/AuthorVerify/send-to-verify`, data);
    return r.data;
}

export async function approveClaim(claimId) {
    const r = await authorizedApiClient.post(`/AuthorVerify/verify-author/${claimId}`);
    return r.data;
}

export async function rejectClaim(claimId) {
    const r = await authorizedApiClient.post(`/AuthorVerify/reject-author/${claimId}`);
    return r.data;
}