<script>
    import ShowMore from '../ShowMore.svelte';
    import Accordion from "../Accordion/Accordion.svelte";
    import { COOKIES_CATEGORIES } from "@data/cookies.const.ts";

    const createField = (label, value) => `<div class="flex justify-items-start gap-8 text-gray-500">
        <p class="text-sm font-bold min-w-16 mb-2">${label}</p>
        <p class="text-sm text-left">${value}</p>
    </div>`;
</script>

<ShowMore startingHeightClass="max-h-28">
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
</ShowMore>
<Accordion accordionData={COOKIES_CATEGORIES.map(cat => ({
    title: cat.type,
    subTitle: cat.description,
    content: `<ul class="flex flex-col mb-2 border-b border-gray-400 border-opacity-70">
        ${cat.cookies.map(cookie =>
            `<li class="pb-4">
                ${createField('Cookie', cookie.name)}
                ${createField('Duration', cookie.duration)}
                ${createField('Description', cookie.description)}
            </li>`
        ).join('')}
    </ul>`
}))} />