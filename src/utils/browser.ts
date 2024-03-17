export type BrowserType = 
    "Firefox"
    | "Chrome"
    | "Safari"
    | "Opera"
    | "Edge"
    | "Internet Eplorer"
    | "Unknown Browser";

export const getUserBroswerName = (): BrowserType | undefined => {
    if (typeof window === undefined) {
        return undefined;
    }
    const userAgent = window.navigator.userAgent;
    if (userAgent.indexOf("Firefox") !== -1) {
        return "Firefox";
    } else if (userAgent.indexOf("Chrome") !== -1) {
        return "Chrome";
    } else if (userAgent.indexOf("Safari") !== -1) {
        return "Safari";
    } else if (userAgent.indexOf("Opera") !== -1 || userAgent.indexOf("OPR") !== -1) {
        return "Opera";
    } else if (userAgent.indexOf("Edge") !== -1) {
        return "Edge";
    } else if (userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident") !== -1) {
        return "Internet Eplorer";
    } else {
        return "Unknown Browser";
    }
}