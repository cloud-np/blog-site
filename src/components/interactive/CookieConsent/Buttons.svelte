<script>
// Define the button classes constant
const BUTTON_CLASSES = "px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 transition-colors";

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