<script>
    import { onMount } from 'svelte';

    // Props interface
    let {
        startingHeightClass,
        buttonLabels = { more: 'Show more', less: 'Show less' }
    } = $props();

    // State using Svelte 5 runes
    let contentRef = $state();
    let contentHeight = $state(0);
    let isExpanded = $state(false);
    let showToggle = $state(false);

    // Toggle expanded state
    function toggleExpand() {
        isExpanded = !isExpanded;
    }

    onMount(() => {
        if (contentRef) {
            // Get the actual content height
            const height = contentRef.scrollHeight;
            contentHeight = height;
        }
    });
</script>

<div bind:this={contentRef}
    class="relative text-base inline-flex overflow-hidden text-ellipsis {isExpanded ? 'max-h-full' : startingHeightClass}"
>
    <slot />
</div>
<p class="underline text-base cursor-pointer my-4" onclick={toggleExpand} >
    {isExpanded ? buttonLabels.less : buttonLabels.more}
</p>