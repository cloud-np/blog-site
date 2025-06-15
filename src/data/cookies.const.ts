type CookieCategoryType = 'Necessary' | 'Functional' | 'Analytics' | 'Performance' | 'Advertisement' | 'Uncategorized';
type TimeUnit =
    | `${number} year${'' | 's'}`
    | `${number} month${'' | 's'}`
    | `${number} day${'' | 's'}`
    | `${number} hour${'' | 's'}`
    | "session"
    | "never";
type CookieDuration = TimeUnit | `${TimeUnit} ${TimeUnit}` | `${TimeUnit} ${TimeUnit} ${TimeUnit}`;

interface Cookie {
    name: string,
    duration: CookieDuration; // TODO: Someday we will map them automatically for now keep it simple
    description: string;
}

const COOKIE_DURATION_MAP: Record<CookieDuration, Date | null> = {
    "session": null,  // No expiration date = session cookie
    "1 hour": new Date(new Date().getTime() + 60 * 60 * 1000),
    "1 month": new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000),
    "6 months": new Date(new Date().getTime() + 180 * 24 * 60 * 60 * 1000),
    "1 year": new Date(new Date().getTime() + 365 * 24 * 60 * 60 * 1000),
    "never": new Date(new Date().getTime() + 10 * 365 * 24 * 60 * 60 * 1000) // 10 years (effectively "never")
};

export interface CookieCategory {
    type: CookieCategoryType;
    description: string;
    cookies: Cookie[];
    isActive: boolean;
}

export const COOKIES_CATEGORIES: CookieCategory[] = [
    {
        type: "Necessary",
        description: "Essential cookies power this site's core functions, enabling secure logins and remembering your privacy choices. These cookies never collect or store your personal information.",
        isActive: true,
        cookies: [
            {
                name: "cookie-consent",
                duration: "1 year",
                description: "This cookie stores user consent preferences for cookie usage, ensuring these choices are remembered across visits. It contains no personal information and only tracks consent status."
            },
            // {
            //     name: "CLOUD_CSRF_TOKEN",
            //     duration: "session", // Missing "max-age" and "expires" === it becomes a "session" cookie
            //     description: "This cookie is set by the provider Craft CMS. This cookie is used for the purpose of website security that is Cross-Site-Request forgery prevention whenever a form is used."
            // }
        ]
    },
    {
        type: "Analytics",
        description: "Analytics cookies track how you use our site, helping us measure visitor numbers, identify traffic sources, and understand user behavior patterns. This data improves our site's performance and your experience.RetryClaude can make mistakes. Please double-check responses.",
        isActive: false,
        cookies: [
            {
                name: "_ga_*",
                duration: "2 years",
                description: "This Google Analytics 4 cookie maintains session state and stores configuration data for a specific measurement ID. It helps track user sessions and preserves analytics settings between visits."
            },
            // {
            //     name: "CLOUD_CSRF_TOKEN",
            //     duration: "session", // Missing "max-age" and "expires" === it becomes a "session" cookie
            //     description: "This cookie is set by the provider Craft CMS. This cookie is used for the purpose of website security that is Cross-Site-Request forgery prevention whenever a form is used."
            // },
            {
                name: "_ga",
                duration: "2 years",
                description: "This Google Analytics cookie distinguishes unique visitors by assigning a randomly generated identifier. It tracks user interactions across sessions to provide insights into website usage patterns, visitor behavior, and site performance metrics for analytics reporting."
            },
        ]
    }
];