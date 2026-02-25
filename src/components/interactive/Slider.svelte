<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	import type { Snippet } from 'svelte';

	interface Props {
		initialXOffset?: number;
		slideTimer?: number;
		children?: Snippet;
	}

	let {
		initialXOffset = 0,
		slideTimer = 50_00,
		children,
	}: Props = $props();

	let sliderWrapper: HTMLDivElement;
	let items: Element[] = $state([]);
	let xTransition = $state(initialXOffset);
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let selectedIndex = $state(0);

	function setItems() {
		// First item is always <astro-slot> here
		const slideElements = sliderWrapper.firstElementChild?.querySelectorAll("[data-slide]");
		if (!slideElements || slideElements.length === 0) {
			return;
		}

		items = Array.from(slideElements);
		items.forEach((element, index) => {
			element.addEventListener('click', () => handleItemClick(index));
			element.addEventListener('mouseenter', () => handleItemEnter(index));
			element.addEventListener('mouseleave', () => handleItemLeave(index));
		});
	}

	function startAutoSlide() {
		if (!items) return;
		intervalId = setInterval(() => {
			items[selectedIndex].classList.remove('focused')
			const nextIndex = (selectedIndex + 1) % items.length;
			goToItem(nextIndex);
			items[nextIndex].classList.add('focused');
		}, slideTimer);
	}

	function handleItemEnter(index: number) {
		const item = items[index];
		stopAutoSlide();
	}

	function handleItemLeave(index: number) {
		startAutoSlide();
	}

	function stopAutoSlide() {
		if (intervalId) {
			items[selectedIndex].classList.remove('focused')
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function goToItem(targetIndex: number) {
		if (selectedIndex === targetIndex) return;

		if (!sliderWrapper) return;

		const ulEl = sliderWrapper.children[0];
		const lis = Array.from(ulEl.children);

		// Get the stable parent container (the one that doesn't transform)
		const stableParent = sliderWrapper.parentElement;
		if(!stableParent) return;
		const stableRect = stableParent.getBoundingClientRect();

		// Get target element position
		const elementRect = lis[targetIndex].getBoundingClientRect();

		// Calculate positions relative to the stable parent
		const elementCenterRelativeToStable = elementRect.left - stableRect.left + elementRect.width / 2;
		const stableCenter = stableRect.width / 2;

		const dist = elementCenterRelativeToStable - stableCenter;
		const newX = xTransition + (-1 * dist);

		xTransition = newX;
		selectedIndex = targetIndex;
	}

	function handleItemClick(index: number) {
		goToItem(index);
	}

	onMount(() => {
		setItems();
		startAutoSlide();
	});

	onDestroy(() => {
		stopAutoSlide();
	});
</script>

<div class="overflow-hidden max-w-full relative">
	<div
		bind:this={sliderWrapper}
		class="transition-transform duration-300 ease-out flex items-center justify-center my-12 mx-auto gap-2 transform-3d"
		style="transform: translate3d({xTransition}px, 0, 0)"
	>
		{#if children}{@render children()}{/if}
	</div>
</div>
