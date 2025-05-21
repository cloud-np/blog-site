export type BrowserType = 
    "Firefox"
    | "Chrome"
    | "Safari"
    | "Opera"
    | "Edge"
    | "Internet Eplorer"
    | "Unknown Browser";

export type CookieValue = 'accepted' | 'rejected';

export function getUserBroswerName(): BrowserType | undefined {
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

export function setCookie(name: string, value: string, days: number = 7, path: string = "/"): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=${path}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
    return document.cookie.split("; ").reduce((r, v) => {
        const parts = v.split("=");
        return parts[0] === name ? decodeURIComponent(parts[1]) : r;
    }, '');
}

export function deleteCookie(name: string, path: string = "/"): void {
    setCookie(name, "", -1, path);
}