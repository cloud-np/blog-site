<script>
    import ShowMore from './ShowMore.svelte';
    import CookiesAccordion from './CookiesAccordion.svelte';
</script>

<h3>Cookies Preferences</h3>
<ShowMore startingHeightClass="max-h-28">
    <p class="mt-6">
        We use cookies to enhance your website experience. These digital tools help with
        navigation and enable important features.
        "Necessary" cookies are automatically saved to your browser as they're essential for the
        site to function properly.
        <br/>
        <br/>
        Additionally, we employ third-party cookies to analyze your usage patterns, remember
        your preferences, and deliver relevant content and ads. These cookies will only be
        stored if you give permission.
        <br/>
        <br/>
        You have full control to enable or disable any cookies, though turning off certain ones
        might impact how you experience our website.
    </p>
</ShowMore>
<CookiesAccordion />