type CookieCategoryType = 'Necessary' | 'Functional' | 'Analytics' | 'Performance' | 'Advertisement' | 'Uncategorized';
type CookieDuration = "session" | "1 hour" | "1 week" | "6 months" | "1 year" | "never";

interface Cookie {
    name: string,
    duration: CookieDuration; // TODO: Someday we will map them automatically for now keep it simple
    description: string;
}

const COOKIE_DURATION_MAP: Record<CookieDuration, Date | null> = {
    "session": null,  // No expiration date = session cookie
    "1 hour": new Date(new Date().getTime() + 60 * 60 * 1000),
    "1 week": new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000),
    "6 months": new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000),
    "1 year": new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
    "never": new Date(new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years (effectively "never")
};

interface CookieCategory {
    type: CookieCategoryType;
    description: string;
    cookies: Cookie[];
    isActive: boolean;
}

const COOKIES: CookieCategory[] = [
    {
        type: "Necessary",
        description: "Essential cookies power this site's core functions, enabling secure logins and remembering your privacy choices. These cookies never collect or store your personal information.",
        isActive: true,
        cookies: [
            {
                name: "cookie-consent",
                duration: "1 year",
                description: "This cookie is set by the provider Craft CMS. This cookie is used for the purpose of website security that is Cross-Site-Request forgery prevention whenever a form is used."
            },
            {
                name: "CLOUD_CSRF_TOKEN",
                duration: "session", // Missing "max-age" and "expires" === it becomes a "session" cookie
                description: "This cookie is set by the provider Craft CMS. This cookie is used for the purpose of website security that is Cross-Site-Request forgery prevention whenever a form is used."
            }
        ]
    },
    {
        type: "Analytics",
        description: "Analytics cookies track how you use our site, helping us measure visitor numbers, identify traffic sources, and understand user behavior patterns. This data improves our site's performance and your experience.RetryClaude can make mistakes. Please double-check responses.",
        isActive: false,
        cookies: [
            {
                name: "cookie-consent",
                duration: "1 year",
                description: "This cookie is set by the provider Craft CMS. This cookie is used for the purpose of website security that is Cross-Site-Request forgery prevention whenever a form is used."
            },
            {
                name: "CLOUD_CSRF_TOKEN",
                duration: "session", // Missing "max-age" and "expires" === it becomes a "session" cookie
                description: "This cookie is set by the provider Craft CMS. This cookie is used for the purpose of website security that is Cross-Site-Request forgery prevention whenever a form is used."
            }
        ]
    }
];