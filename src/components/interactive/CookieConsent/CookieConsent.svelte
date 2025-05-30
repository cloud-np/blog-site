<script>
    import CookieIcon from '@assets/icons/cookie.svg?raw';

    // Reactive state using Svelte 5 runes
    let state = $state({
        isPreferenceActive: false,
        isVisible: true
    });

    // Event handlers
    function handlePreference() {
        state.isPreferenceActive = !state.isPreferenceActive;
    }

    function handleReject() {
        // Add your reject logic here
        state.isVisible = false;
    }

    function handleAccept() {
        // Add your accept logic here
        state.isVisible = false;
    }
</script>
<style>
    @import './cookie-consent.css';
</style>

<div class={[
  state.isPreferenceActive ? "" : "overflow-hidden",
  state.isVisible ? "" : "hidden"
].join(" ")}>
    <div class={[
    "cookie-normal cookie-banner rounded-full",
    state.isPreferenceActive ? "cookie-normal-pref-active" : ""
  ].join(" ")}>
        <span class="cookie w-16 h-16 absolute -top-5">
            {@html CookieIcon}
        </span>
        <div class="cookie-content p-4 justify-around items-center gap-4">
            <p class="text-center mx-12">
                This website uses cookies to ensure you get the best experience.<br/>
                Of course they are turned off by default. <a class="underline" href="/privacy-policy">Learn more</a>
            </p>
            <!--            <CookieButtons-->
            <!--                    onPreference={handlePreference}-->
            <!--                    onReject={handleReject}-->
            <!--                    onAccept={handleAccept}-->
            <!--            />-->
        </div>
    </div>

    <div class={[
    "cookie-banner cookie-pref",
    state.isPreferenceActive ? "cookie-pref-active" : ""
  ].join(" ")}>
        <div class="cookie-pref-content">
            <!--            <Preferences />-->
        </div>
        <!--        <CookieButtons-->
        <!--                onPreference={handlePreference}-->
        <!--                onReject={handleReject}-->
        <!--                onAccept={handleAccept}-->
        <!--        />-->
    </div>
</div>