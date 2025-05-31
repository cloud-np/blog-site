<script lang="ts">
    import ArrowIcon from '@assets/icons/arrow.svg?raw';

    // Props
    let {
        title,
        subTitle = undefined,
        isOpen = false,
        onToggle
    } = $props();

    let contentRef = $state();
</script>

<div class="mb-2">
    <div class="flex flex-col">
        <button
            class="w-full px-4 py-3 text-left cursor-pointer flex items-center font-medium text-gray-400 focus:outline-none"
            onclick={onToggle}
            aria-expanded={isOpen}
            type="button"
        >
            <span class="w-4 h-4 transition-transform transform duration-200 mr-2 {isOpen ? 'rotate-0' : '-rotate-90'}" >
                {@html ArrowIcon}
            </span>
            <span>{title}</span>
        </button>
        {#if subTitle}
            <span class="px-4 pb-2 text-sm text-gray-500">{subTitle}</span>
        {/if}
    </div>

    <div
            bind:this={contentRef}
            class="transition-all duration-300 ease-in-out overflow-hidden {isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}"
    >
        <div class="px-4 py-3">
            <slot />
        </div>
    </div>
</div>
