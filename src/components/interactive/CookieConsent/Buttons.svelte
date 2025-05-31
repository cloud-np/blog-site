<script>
// Define the button classes constant
const BUTTON_CLASSES = "rounded-md bg-slate-800 py-2 px-4 m-1 border border-transparent text-center text-sm text-white transition-all shadow-md hover:shadow-lg focus:bg-slate-700 focus:shadow-none active:bg-slate-700 hover:bg-slate-700 active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none";

// Props interface
let { onPreference, onReject, onAccept } = $props();
</script>

<div class="cookie-buttons">
    <button
            id="cookie-preference-btn"
            onclick={onPreference}
            class={BUTTON_CLASSES}
            type="button"
    >
        Preference
    </button>
    <button
            id="cookie-reject-btn"
            onclick={onReject}
            class={BUTTON_CLASSES}
            type="button"
    >
        Reject Non-Essential
    </button>
    <button
            id="cookie-accept-btn"
            onclick={onAccept}
            class={BUTTON_CLASSES}
            type="button"
    >
        Accept All
    </button>
</div>