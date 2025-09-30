<script lang="ts">
	import type { ImageMetadata } from "astro";

	interface Props {
		tile?: { squareName: string; piece?: { type: string; color: string; imgSrc?: ImageMetadata } } | null;
		color?: "light" | "dark";
		squareSize?: number;
		onTileClick?: () => void;
		isClicked?: boolean;
		clickedColor?: string;
		onDragStart?: () => void;
		onDrop?: () => void;
	}

	let {
		tile = null,
		color = "light",
		squareSize = 64,
		onTileClick,
		isClicked = false,
		clickedColor = "",
		onDragStart,
		onDrop,
	}: Props = $props();

	function handleClick() {
		onTileClick?.();
	}

	function handleDragStart(e: DragEvent) {
		if (tile?.piece) {
			e.dataTransfer!.effectAllowed = "move";
			onDragStart?.();
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = "move";
		}
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		onDrop?.();
	}
</script>

<div
	id={tile?.squareName}
	class="square {color}"
	onclick={handleClick}
	onkeydown={e => e.key === "Enter" && handleClick()}
	ondragover={handleDragOver}
	ondrop={handleDrop}
	role="button"
	tabindex="0"
	style="height: {squareSize}px; width: {squareSize}px;">
	{#if isClicked}
		<span
			id="{tile?.squareName}spanBefore"
			class="clicked-overlay {clickedColor}"
			style="height: {squareSize}px; width: {squareSize}px;">
		</span>
	{/if}

	{#if tile?.piece?.type !== "empty" && tile?.piece?.imgSrc}
		<img
			draggable="true"
			ondragstart={handleDragStart}
			loading="lazy"
			decoding="async"
			fetchpriority="low"
			class="piece clickable"
			style="width: {squareSize}px;"
			src={tile.piece.imgSrc.src}
			alt={tile.piece.type}
		/>
	{/if}
</div>

<style>
	.square {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		user-select: none;
	}

	.square.light {
		background-color: #f0d9b5;
	}

	.square.dark {
		background-color: #b58863;
	}

	.square:hover {
		opacity: 0.9;
	}

	.clicked-overlay {
		position: absolute;
		top: 0;
		left: 0;
		pointer-events: none;
		border: 3px solid;
		box-sizing: border-box;
		border-radius: 2px;
	}

	.clicked-overlay.yellow {
		border-color: #ffeb3b;
	}

	.clicked-overlay.green {
		border-color: #4caf50;
	}

	.clicked-overlay.red {
		border-color: #f44336;
	}

	.piece {
		position: relative;
		z-index: 1;
		pointer-events: auto;
	}

	.clickable {
		cursor: grab;
	}

	.clickable:active {
		cursor: grabbing;
	}
</style>
