<script lang="ts">
	import bk from "@assets/chess/bk.webp";
	import bq from "@assets/chess/bq.webp";
	import br from "@assets/chess/br.webp";
	import bb from "@assets/chess/bb.webp";
	import bn from "@assets/chess/bn.webp";
	import bp from "@assets/chess/bp.webp";
	import wk from "@assets/chess/wk.webp";
	import wq from "@assets/chess/wq.webp";
	import wr from "@assets/chess/wr.webp";
	import wb from "@assets/chess/wb.webp";
	import wn from "@assets/chess/wn.webp";
	import wp from "@assets/chess/wp.webp";
	import type { ImageMetadata } from "astro";
	import { fade } from "svelte/transition";
	import {
		FILES,
		applyMove,
		checkedKingSquare,
		gameStatus,
		initialState,
		legalMoves,
		squareName,
		toGrid,
		type GameState,
		type Piece,
	} from "./chess-rules";

	interface Props {
		squareSize?: number;
	}

	let { squareSize = 28 }: Props = $props();

	const PIECE_IMAGES: Record<string, ImageMetadata> = { bk, bq, br, bb, bn, bp, wk, wq, wr, wb, wn, wp };
	const PIECE_NAMES: Record<Piece["type"], string> = {
		k: "king",
		q: "queen",
		r: "rook",
		b: "bishop",
		n: "knight",
		p: "pawn",
	};
	const SQUARES = Array.from({ length: 64 }, (_, i) => i);
	const DRAG_THRESHOLD = 4;

	let boardEl: HTMLDivElement;
	let game = $state.raw<GameState>(initialState());
	let selected = $state<number | null>(null);
	let lastMove = $state<{ from: number; to: number } | null>(null);
	let drag = $state<{ id: number; x: number; y: number } | null>(null);
	let press: { square: number; pieceId: number; x: number; y: number; deselectOnUp: boolean } | null = null;

	const grid = $derived(toGrid(game.pieces));
	const targets = $derived(selected === null ? [] : legalMoves(game, selected));
	const status = $derived(gameStatus(game));
	const checkSquare = $derived(checkedKingSquare(game));
	const gameOver = $derived(status === "checkmate" || status === "stalemate");
	const side = $derived(game.turn === "w" ? "White" : "Black");
	const statusText = $derived(
		status === "checkmate"
			? `Checkmate · ${game.turn === "w" ? "Black" : "White"} wins`
			: status === "stalemate"
				? "Stalemate · draw"
				: status === "check"
					? `Check · ${side} to move`
					: `${side} to move`
	);

	const isLight = (square: number) => ((square >> 3) + (square & 7)) % 2 === 0;
	const targetFor = (square: number) => targets.find(m => m.to === square);
	const isMovable = (square: number) => !gameOver && grid[square]?.color === game.turn;

	function squareLabel(square: number) {
		const piece = grid[square];
		const name = squareName(square);
		if (!piece) return name;
		return `${name}, ${piece.color === "w" ? "white" : "black"} ${PIECE_NAMES[piece.type]}`;
	}

	function tryMove(from: number, to: number) {
		const move = legalMoves(game, from).find(m => m.to === to);
		if (!move) return false;
		game = applyMove(game, move);
		lastMove = { from, to };
		selected = null;
		return true;
	}

	/** Shared tap/keyboard behaviour: move to a highlighted square, otherwise (de)select. */
	function activate(square: number) {
		if (gameOver) return;
		if (selected !== null && selected !== square && tryMove(selected, square)) return;
		selected = isMovable(square) && selected !== square ? square : null;
	}

	function squareFromPoint(x: number, y: number) {
		const rect = boardEl.getBoundingClientRect();
		const col = Math.floor((x - rect.left) / squareSize);
		const row = Math.floor((y - rect.top) / squareSize);
		return row >= 0 && row < 8 && col >= 0 && col < 8 ? row * 8 + col : null;
	}

	function handlePointerDown(event: PointerEvent) {
		if (event.button !== 0 || gameOver) return;
		const square = squareFromPoint(event.clientX, event.clientY);
		if (square === null) return;

		if (selected !== null && selected !== square && tryMove(selected, square)) return;

		const piece = grid[square];
		if (!piece || piece.color !== game.turn) {
			selected = null;
			return;
		}

		event.preventDefault();
		press = {
			square,
			pieceId: piece.id,
			x: event.clientX,
			y: event.clientY,
			deselectOnUp: selected === square,
		};
		selected = square;
		boardEl.setPointerCapture(event.pointerId);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!press) return;
		if (!drag && Math.hypot(event.clientX - press.x, event.clientY - press.y) < DRAG_THRESHOLD) return;
		const rect = boardEl.getBoundingClientRect();
		drag = {
			id: press.pieceId,
			x: event.clientX - rect.left - squareSize / 2,
			y: event.clientY - rect.top - squareSize / 2,
		};
	}

	function handlePointerUp(event: PointerEvent) {
		if (!press) return;
		if (drag) {
			const square = squareFromPoint(event.clientX, event.clientY);
			if (square !== null && square !== press.square) tryMove(press.square, square);
		} else if (press.deselectOnUp) {
			selected = null;
		}
		drag = null;
		press = null;
	}

	function handleClick(event: MouseEvent, square: number) {
		// Pointer input is handled on pointerdown; this only covers keyboard and assistive tech.
		if (event.detail === 0) activate(square);
	}

	function reset() {
		game = initialState();
		selected = null;
		lastMove = null;
		drag = null;
		press = null;
	}

	function pieceTransform(piece: Piece) {
		if (drag?.id === piece.id) return `translate(${drag.x}px, ${drag.y}px) scale(1.18)`;
		return `translate(${(piece.square & 7) * squareSize}px, ${(piece.square >> 3) * squareSize}px)`;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		bind:this={boardEl}
		class="board"
		class:game-over={gameOver}
		style="--size: {squareSize}px;"
		role="group"
		aria-label="Chess board"
		onpointerdown={handlePointerDown}
		onpointermove={handlePointerMove}
		onpointerup={handlePointerUp}
		onpointercancel={handlePointerUp}>
		<div class="squares">
			{#each SQUARES as square (square)}
				{@const target = targetFor(square)}
				<button
					type="button"
					class="square"
					class:light={isLight(square)}
					class:movable={isMovable(square)}
					class:selected={selected === square}
					class:last-move={lastMove?.from === square || lastMove?.to === square}
					class:in-check={checkSquare === square}
					class:target={!!target}
					class:capture={!!target?.capture}
					aria-label={squareLabel(square)}
					aria-pressed={selected === square}
					onclick={e => handleClick(e, square)}>
					{#if (square & 7) === 0}
						<span class="coord rank">{8 - (square >> 3)}</span>
					{/if}
					{#if square >> 3 === 7}
						<span class="coord file">{FILES[square & 7]}</span>
					{/if}
				</button>
			{/each}
		</div>

		<div class="pieces" aria-hidden="true">
			{#each game.pieces as piece (piece.id)}
				<img
					class="piece"
					class:dragging={drag?.id === piece.id}
					src={PIECE_IMAGES[`${piece.color}${piece.type}`].src}
					alt=""
					width={squareSize}
					height={squareSize}
					draggable="false"
					decoding="async"
					style="transform: {pieceTransform(piece)}"
					out:fade={{ duration: 160 }} />
			{/each}
		</div>
	</div>

	<div class="flex w-full items-center justify-between gap-3" style="max-width: {squareSize * 8}px">
		<p class="status flex items-center gap-2 text-xs text-neutral-300" aria-live="polite">
			<span class="turn-dot" class:black={game.turn === "b"} class:alert={status !== "playing"}></span>
			{statusText}
		</p>
		<button
			type="button"
			onclick={reset}
			class="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white">
			Reset
		</button>
	</div>
</div>

<style>
	.board {
		--light: #dee3e6;
		--dark: #8ca2ad;
		--accent: 40, 200, 220;
		position: relative;
		width: calc(var(--size) * 8);
		height: calc(var(--size) * 8);
		border-radius: 6px;
		box-shadow:
			0 0 0 1px rgba(255, 255, 255, 0.1),
			0 18px 40px -12px rgba(0, 0, 0, 0.7),
			0 0 40px rgba(98, 190, 255, 0.1);
		touch-action: manipulation;
		user-select: none;
		-webkit-user-select: none;
	}

	.squares {
		display: grid;
		grid-template-columns: repeat(8, var(--size));
		grid-template-rows: repeat(8, var(--size));
		border-radius: inherit;
		overflow: hidden;
	}

	.square {
		position: relative;
		padding: 0;
		border: 0;
		background: var(--dark);
		cursor: default;
	}

	.square.light {
		background: var(--light);
	}

	/* Let the page scroll from empty squares, but grab pieces for dragging on touch. */
	.square.movable {
		cursor: grab;
		touch-action: none;
	}

	.square.target {
		cursor: pointer;
	}

	.square::before,
	.square::after {
		content: "";
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.square.last-move::before {
		background: rgba(var(--accent), 0.42);
	}

	.square.selected::before {
		background: rgba(var(--accent), 0.55);
	}

	.square.in-check::before {
		background: radial-gradient(circle, rgba(255, 70, 70, 0.95) 0%, rgba(230, 30, 30, 0.45) 45%, transparent 75%);
	}

	.square.target::after {
		background: radial-gradient(circle, rgba(10, 30, 45, 0.38) 22%, transparent 24%);
	}

	.square.target.capture::after {
		background: radial-gradient(circle, transparent 72%, rgba(10, 30, 45, 0.4) 74%);
	}

	.square.target:hover::after {
		background: rgba(var(--accent), 0.4);
	}

	.square:focus-visible {
		outline: 2px solid rgb(var(--accent));
		outline-offset: -2px;
		z-index: 1;
	}

	.coord {
		position: absolute;
		font-size: 7px;
		font-weight: 700;
		line-height: 1;
		color: var(--light);
		pointer-events: none;
	}

	.square.light .coord {
		color: var(--dark);
	}

	.coord.rank {
		top: 2px;
		left: 2px;
	}

	.coord.file {
		right: 2px;
		bottom: 2px;
	}

	.pieces {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.piece {
		position: absolute;
		top: 0;
		left: 0;
		transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1);
		will-change: transform;
	}

	.piece.dragging {
		z-index: 10;
		transition: none;
		filter: drop-shadow(0 6px 8px rgba(0, 0, 0, 0.45));
		cursor: grabbing;
	}

	.game-over .pieces {
		opacity: 0.85;
	}

	.turn-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: #f1f5f9;
		box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3);
	}

	.turn-dot.black {
		background: #0f172a;
	}

	.turn-dot.alert {
		box-shadow:
			0 0 0 1px rgba(255, 90, 90, 0.8),
			0 0 8px rgba(255, 90, 90, 0.6);
	}

	@media (prefers-reduced-motion: reduce) {
		.piece {
			transition: none;
		}
	}
</style>
