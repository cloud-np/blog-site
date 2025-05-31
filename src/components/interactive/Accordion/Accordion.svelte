<script lang="ts">
	import AccordionItem from './AccordionItem.svelte';

    // Props interface
    let {
        allowMultiple = false,
        defaultOpenItems = [0],
        accordionData = []
    } = $props();

    // State using Svelte 5 runes
    let openItems = $state(new Set(defaultOpenItems));

    // Toggle item function
    function toggleItem(index) {
        const newOpenItems = new Set(openItems);

        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            if (!allowMultiple) {
                newOpenItems.clear();
            }
            newOpenItems.add(index);
        }

        openItems = newOpenItems;
    }

    // Check if item is open
    function isOpen(index) {
        return openItems.has(index);
    }
</script>

<div class="p-2 max-w-4xl mx-auto">
	<div class="space-y-2">
		{#each accordionData as item, index (index)}
			<AccordionItem
                title={item.title}
                subTitle={item.subTitle}
                isOpen={isOpen(index)}
                onToggle={() => toggleItem(index)}
			>
				{@html item.content}
			</AccordionItem>
		{/each}
	</div>
</div>