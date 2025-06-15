<script>
// Define the button classes constant
const BUTTON_CLASSES = "rounded-md py-2 px-4 m-1 border border-slate-700 text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

// Props interface
let { onPreference, onReject, onAccept, isPreferenceActive = false } = $props();
</script>

<div class="cookie-buttons">
    <button
            id="cookie-preference-btn"
            onclick={isPreferenceActive ? onReject : onPreference}
            class={BUTTON_CLASSES}
            type="button"
    >
        {isPreferenceActive ? "Reject All" : "Preference"}
    </button>
    <button
            id="cookie-reject-btn"
            onclick={isPreferenceActive ? onPreference : onReject}
            class={BUTTON_CLASSES}
            type="button"
    >
        {isPreferenceActive ? "Save Preferences" : "Reject Non-Essential"}
    </button>
    <button
            id="cookie-accept-btn"
            onclick={onAccept}
            class={`${BUTTON_CLASSES} bg-slate-700 border-transparent`}
            type="button"
    >
        Accept All
    </button>
</div>