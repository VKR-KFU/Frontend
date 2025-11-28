import { franc } from "franc-min";

export function detectLangCodeByFranc(text = "") {
    const code = franc(text || "", { minLength: 10 });


    if (code === "rus")
        return "ru";
    if (code === "eng")
        return "en";
    if (code === "kir")
        return "ky";

    return "unknown";
}
