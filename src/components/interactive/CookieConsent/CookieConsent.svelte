<script lang="ts">
    import CookieIcon from '@assets/icons/cookie.svg?raw';
    import CloseIcon from '@assets/icons/close.svg?raw';
    import Buttons from './Buttons.svelte';
    import { slide } from 'svelte/transition';
    import Preferences from "@components/interactive/CookieConsent/Preferences.svelte";
    import {deleteAllCookiesExceptConsent, disableGa, enableGa, setCookie} from "@utils/browser";

    // Reactive state using Svelte 5 runes
    let state = $state({
        isPreferenceActive: true,
        isVisible: true
    });

    // Event handlers
    function handlePreference() {
        state.isPreferenceActive = !state.isPreferenceActive;
    }

    function handleReject() {
        setCookie('cookie-consent', 'rejected', 365);
        setCookie('analytics-cookies', 'rejected', 365);
        state.isVisible = false;
        deleteAllCookiesExceptConsent();
        disableGa();
    }

    function handleAccept() {
        setCookie('cookie-consent', 'accepted', 365);
        setCookie('analytics-cookies', 'accepted', 365);
        state.isVisible = false;
        enableGa();
    }
</script>

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
            <Buttons
                onPreference={handlePreference}
                onReject={handleReject}
                onAccept={handleAccept}
            />
        </div>
    </div>

    {#if state.isPreferenceActive}
        <div transition:slide class="cookie-banner cookie-pref">
            <div class="flex justify-between items-center mb-4">
                <h3>Cookies Preferences</h3>
                <button type="button" onclick={handlePreference}>
                    {@html CloseIcon }
                </button>
            </div>
            <div class="cookie-pref-content">
                <Preferences />
            </div>
            <Buttons
                    onPreference={handlePreference}
                    onReject={handleReject}
                    onAccept={handleAccept}
            />
        </div>
    {/if}
</div>

<style>
    @import './cookie-consent.css';
</style>
