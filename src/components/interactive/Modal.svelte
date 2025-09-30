<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	// Transition functions
	onMount(() => {
		setItems();
	});

	function handleItemClick(index: number) {

	}

	function setItems() {
		// First item is always <astro-slot> here
		items = Array.from(modalWrapper.firstElementChild!.querySelectorAll("[data-modal]") ?? []);
		items.forEach((element, index) => {
			element.addEventListener('click', () => handleItemClick(index));
		});
	}
</script>

<div
	bind:this={modalWrapper}
>
	<slot />
</div>
