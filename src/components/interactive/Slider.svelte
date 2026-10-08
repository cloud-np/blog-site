<script lang="ts">
	import { onMount } from "svelte";
	import type { Snippet } from "svelte";

	interface Props {
		/** Time each slide stays selected before auto-advancing (ms). */
		slideTimer?: number;
		startIndex?: number;
		label?: string;
		children?: Snippet;
	}

	let { slideTimer = 4000, startIndex = 0, label = "Gallery", children }: Props = $props();

	const SWIPE_THRESHOLD = 40;

	let viewport: HTMLDivElement;
	let track: HTMLDivElement;
	let items: HTMLElement[] = $state([]);
	let selected = $state(0);
	let offset = $state(0);
	let dragDx = $state(0);
	let dragging = $state(false);
	let hovering = $state(false);
	/** Only keyboard focus pauses autoplay; clicking an arrow shouldn't stop it for good. */
	let focusWithin = $state(false);
	let onScreen = $state(false);
	let reducedMotion = $state(false);

	let pointerStartX: number | null = null;
	let suppressClick = false;

	const paused = $derived(hovering || focusWithin || dragging || !onScreen);

	function goTo(index: number) {
		if (!items.length) return;
		selected = (index + items.length) % items.length;
	}

	const next = () => goTo(selected + 1);
	const prev = () => goTo(selected - 1);

	function centerSelected() {
		const item = items[selected];
		if (!item || !viewport) return;
		offset = viewport.clientWidth / 2 - (item.offsetLeft + item.offsetWidth / 2);
	}

	$effect(() => {
		if (!items.length) return;
		items.forEach((item, i) => {
			const isSelected = i === selected;
			item.classList.toggle("focused", isSelected);
			item.setAttribute("aria-current", String(isSelected));
		});
		centerSelected();
		viewport?.dispatchEvent(new CustomEvent("gallery:select", { detail: { index: selected }, bubbles: true }));
	});

	function handleClick(event: MouseEvent) {
		if (suppressClick) {
			suppressClick = false;
			return;
		}
		const item = (event.target as Element).closest<HTMLElement>("[data-slide]");
		if (item) goTo(items.indexOf(item));
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === "ArrowRight") next();
		else if (event.key === "ArrowLeft") prev();
		else return;
		event.preventDefault();
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		pointerStartX = event.clientX;
		suppressClick = false;
	}

	function handlePointerMove(event: PointerEvent) {
		if (pointerStartX === null) return;
		const dx = event.clientX - pointerStartX;
		if (!dragging && Math.abs(dx) > 6) {
			dragging = true;
			viewport.setPointerCapture(event.pointerId);
		}
		// Resist a little so the strip feels attached to the finger without flying away.
		if (dragging) dragDx = dx * 0.6;
	}

	function handlePointerUp() {
		if (dragging) {
			if (dragDx < -SWIPE_THRESHOLD * 0.6) next();
			else if (dragDx > SWIPE_THRESHOLD * 0.6) prev();
			suppressClick = true;
		}
		dragging = false;
		dragDx = 0;
		pointerStartX = null;
	}

	onMount(() => {
		reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		items = Array.from(track.querySelectorAll<HTMLElement>("[data-slide]"));
		items.forEach((item, i) => {
			item.setAttribute("role", "group");
			item.setAttribute("aria-roledescription", "slide");
			item.setAttribute("aria-label", `${i + 1} of ${items.length}`);
		});
		selected = Math.min(Math.max(startIndex, 0), Math.max(items.length - 1, 0));

		const resizeObserver = new ResizeObserver(() => centerSelected());
		resizeObserver.observe(viewport);

		const intersectionObserver = new IntersectionObserver(entries => {
			onScreen = entries.some(e => e.isIntersecting);
		});
		intersectionObserver.observe(viewport);

		return () => {
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
		};
	});
</script>

<div
	class="slider"
	role="region"
	aria-roledescription="carousel"
	aria-label={label}
	onmouseenter={() => (hovering = true)}
	onmouseleave={() => (hovering = false)}
	onfocusin={e => (focusWithin = (e.target as Element).matches(":focus-visible"))}
	onfocusout={() => (focusWithin = false)}>
	<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
	<div
		bind:this={viewport}
		class="slider-viewport"
		role="group"
		aria-label="Slides, use the arrow keys to browse"
		tabindex="0"
		onkeydown={handleKeydown}
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={track}
			class="slider-track"
			class:dragging
			onclick={handleClick}
			style="transform: translate3d({offset + dragDx}px, 0, 0)">
			{#if children}{@render children()}{/if}
		</div>
	</div>

	<div class="slider-controls">
		<button type="button" class="slider-button" onclick={prev} aria-label="Previous slide">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>

		<div class="slider-progress" aria-hidden="true">
			{#if !reducedMotion && items.length}
				{#key selected}
					<span
						class="slider-progress-bar"
						class:paused
						style="animation-duration: {slideTimer}ms"
						onanimationend={next}></span>
				{/key}
			{/if}
		</div>

		<span class="slider-count" aria-live="polite">
			{String(selected + 1).padStart(2, "0")}<span class="text-neutral-600"> / {String(items.length).padStart(2, "0")}</span>
		</span>

		<button type="button" class="slider-button" onclick={next} aria-label="Next slide">
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
		</button>
	</div>
</div>

<style>
	.slider {
		position: relative;
		max-width: 100%;
	}

	.slider-viewport {
		position: relative;
		overflow: hidden;
		padding: 1.25rem 0;
		touch-action: pan-y;
		cursor: grab;
		border-radius: 0.75rem;
		-webkit-mask-image: linear-gradient(to right, transparent, #000 14%, #000 86%, transparent);
		mask-image: linear-gradient(to right, transparent, #000 14%, #000 86%, transparent);
	}

	.slider-viewport:focus-visible {
		outline: 1px solid rgba(98, 208, 255, 0.6);
		outline-offset: 2px;
	}

	.slider-viewport:active {
		cursor: grabbing;
	}

	.slider-track {
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: max-content;
		transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
		user-select: none;
	}

	.slider-track.dragging {
		transition: none;
	}

	.slider-controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.25rem;
	}

	.slider-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		flex-shrink: 0;
		border-radius: 999px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.04);
		color: rgb(212 212 212);
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease;
	}

	.slider-button:hover,
	.slider-button:focus-visible {
		outline: none;
		border-color: rgba(98, 208, 255, 0.5);
		background: rgba(98, 208, 255, 0.1);
		color: white;
	}

	.slider-progress {
		position: relative;
		flex: 1;
		height: 2px;
		border-radius: 2px;
		background: rgba(255, 255, 255, 0.08);
		overflow: hidden;
	}

	.slider-progress-bar {
		position: absolute;
		inset: 0;
		transform-origin: left;
		background: linear-gradient(90deg, rgba(98, 208, 255, 0.4), rgba(98, 208, 255, 0.9));
		animation-name: slide-progress;
		animation-timing-function: linear;
		animation-fill-mode: forwards;
	}

	.slider-progress-bar.paused {
		animation-play-state: paused;
	}

	.slider-count {
		font-size: 11px;
		color: rgb(163 163 163);
		font-variant-numeric: tabular-nums;
	}

	@keyframes slide-progress {
		from {
			transform: scaleX(0);
		}
		to {
			transform: scaleX(1);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.slider-track {
			transition: none;
		}
	}
</style>
