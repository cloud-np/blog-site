<script lang="ts">
    import ShowMore from '../ShowMore.svelte';
    import Accordion from "../Accordion/Accordion.svelte";
    import { COOKIES_CATEGORIES } from "@data/cookies.const.ts";

    // TODO: This should be a snippet instead based on Svelte "best practices".
    const createField = (label, value) => `<div class="flex justify-items-start gap-8 text-gray-500">
        <p class="text-sm font-bold min-w-16 mb-2">${label}</p>
        <p class="text-sm text-left">${value}</p>
    </div>`;

    const cookiesWithChecks = COOKIES_CATEGORIES.map((c) => ({ ...c, checked: false }));
    const handleClick = (event) => {
        event.stopPropagation();
    }
</script>

<ShowMore startingHeightClass="max-h-28">
    {#snippet content()}
        <p class="mt-4">
            We use cookies to enhance your website experience. These digital tools help with
            navigation and enable important features.
            "Necessary" cookies are automatically saved to your browser as they're essential for the
            site to function properly.
            <br/>
            Additionally, we employ third-party cookies to analyze your usage patterns, remember
            your preferences, and deliver relevant content and ads. These cookies will only be
            stored if you give permission.
            <br/>
            You have full control to enable or disable any cookies, though turning off certain ones
            might impact how you experience our website.
        </p>
    {/snippet}
</ShowMore>

<Accordion accordionData={cookiesWithChecks}>
    {#snippet title(category)}
        <span>{category.type}</span>
        <div class="flex items-center z-10">
            <input onclick={(e) => e.stopPropagation()} bind:checked={category.checked} type="checkbox" class="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
        </div>
    {/snippet}

    {#snippet content(category)}
        <ul class="flex flex-col mb-2 border-b border-gray-400 border-opacity-70">
            {#each category.cookies as cookie}
                <li class="pb-4">
                    {@html createField('Cookie', cookie.name)}
                    {@html createField('Duration', cookie.duration)}
                    {@html createField('Description', cookie.description)}
                </li>
            {/each}
        </ul>
    {/snippet}
</Accordion>