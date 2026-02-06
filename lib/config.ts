export const API_BASE_URL = "https://api.lumos-uat.com";
export const API_BLOG_URL = "http://127.0.0.1:8000";
export const LOCAL_API_BASE = "http://127.0.0.1:8000";

export const getApiUrl = (path: string) => {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    // Remove trailing slash from base if present
    const normalizedBase = API_BASE_URL.replace(/\/$/, "");
    return `${normalizedBase}${normalizedPath}`;
};

export const getCommonHeaders = (token?: { value: string } | null): HeadersInit => {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token.value}`;
    }

    return headers;
};
