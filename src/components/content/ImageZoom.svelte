<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();
    let open = $state(false);
    let zoomed = $state(false);

    function openModal() {
        open = true;
        zoomed = false;
    }

    function closeModal() {
        open = false;
        zoomed = false;
    }

    function toggleZoom(e: MouseEvent) {
        e.stopPropagation();
        zoomed = !zoomed;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === 'Escape') {
            if (zoomed) {
                zoomed = false;
            } else {
                closeModal();
            }
        }
    }
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

<button class="image-zoom-trigger" onclick={openModal} aria-label="Zoom image">
    {@render children()}
    <span class="zoom-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            <line x1="11" y1="8" x2="11" y2="14"/>
            <line x1="8" y1="11" x2="14" y2="11"/>
        </svg>
    </span>
</button>

{#if open}
    <div class="image-zoom-overlay" class:zoomed onclick={zoomed ? () => { zoomed = false; } : closeModal} onkeydown={handleKeydown} role="dialog" aria-modal="true" tabindex="-1">
        <button class="image-zoom-close" onclick={closeModal} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        </button>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="image-zoom-content" class:zoomed onclick={toggleZoom}>
            {@render children()}
        </div>
    </div>
{/if}

<style>
    .image-zoom-trigger {
        position: relative;
        display: inline-block;
        cursor: zoom-in;
        border: none;
        background: none;
        padding: 0;
        margin: 0;
    }

    .zoom-icon {
        position: absolute;
        bottom: 12px;
        right: 12px;
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.7;
        transition: opacity 0.2s ease;
        pointer-events: none;
    }

    .image-zoom-trigger:hover .zoom-icon {
        opacity: 1;
    }

    .image-zoom-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: zoom-out;
        padding: 2rem;
    }

    .image-zoom-overlay.zoomed {
        overflow: auto;
        cursor: default;
        align-items: flex-start;
        justify-content: flex-start;
        padding: 1rem;
    }

    .image-zoom-close {
        position: fixed;
        top: 1rem;
        right: 1rem;
        background: rgba(0, 0, 0, 0.6);
        border: none;
        color: white;
        cursor: pointer;
        opacity: 0.7;
        transition: opacity 0.2s ease;
        padding: 0.5rem;
        border-radius: 50%;
        z-index: 10000;
    }

    .image-zoom-close:hover {
        opacity: 1;
    }

    .image-zoom-content {
        max-width: 90vw;
        max-height: 90vh;
        cursor: zoom-in;
    }

    .image-zoom-content.zoomed {
        max-width: none;
        max-height: none;
        cursor: zoom-out;
    }

    .image-zoom-content :global(img) {
        max-width: 90vw;
        max-height: 90vh;
        width: auto;
        height: auto;
        object-fit: contain;
    }

    .image-zoom-content.zoomed :global(img) {
        max-width: none;
        max-height: none;
        width: auto;
        height: auto;
    }
</style>
