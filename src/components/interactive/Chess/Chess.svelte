<script lang="ts">
	import Square from './Square.svelte';
	import bk from '@assets/chess/bk.png';
	import bq from '@assets/chess/bq.png';
	import br from '@assets/chess/br.png';
	import bb from '@assets/chess/bb.png';
	import bn from '@assets/chess/bn.png';
	import bp from '@assets/chess/bp.png';
	import wk from '@assets/chess/wk.png';
	import wq from '@assets/chess/wq.png';
	import wr from '@assets/chess/wr.png';
	import wb from '@assets/chess/wb.png';
	import wn from '@assets/chess/wn.png';
	import wp from '@assets/chess/wp.png';
	import type { ImageMetadata } from 'astro';

	type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn' | 'empty';
	type PieceColor = 'white' | 'black';

	interface Piece {
		type: PieceType;
		color: PieceColor;
		imgSrc?: ImageMetadata;
	}

	interface Tile {
		squareName: string;
		piece?: Piece;
	}

	let squareSize = $state(28);
	let selectedSquare = $state<string | null>(null);
	let draggedFrom = $state<string | null>(null);

	// Initialize an 8x8 chess board
	function initializeBoard(): Tile[][] {
		const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
		const ranks = [8, 7, 6, 5, 4, 3, 2, 1];
		const newBoard: Tile[][] = [];

		for (let rank of ranks) {
			const row: Tile[] = [];
			for (let file of files) {
				const squareName = `${file}${rank}`;
				row.push({
					squareName,
					piece: getPieceForSquare(squareName)
				});
			}
			newBoard.push(row);
		}

		return newBoard;
	}

	// Define starting positions for pieces
	function getPieceForSquare(squareName: string): Piece | undefined {
		const pieceMap: Record<string, Piece> = {
			a1: { type: 'rook', color: 'white', imgSrc: wr },
			b1: { type: 'knight', color: 'white', imgSrc: wn },
			c1: { type: 'bishop', color: 'white', imgSrc: wb },
			d1: { type: 'queen', color: 'white', imgSrc: wq },
			e1: { type: 'king', color: 'white', imgSrc: wk },
			f1: { type: 'bishop', color: 'white', imgSrc: wb },
			g1: { type: 'knight', color: 'white', imgSrc: wn },
			h1: { type: 'rook', color: 'white', imgSrc: wr },
			a2: { type: 'pawn', color: 'white', imgSrc: wp },
			b2: { type: 'pawn', color: 'white', imgSrc: wp },
			c2: { type: 'pawn', color: 'white', imgSrc: wp },
			d2: { type: 'pawn', color: 'white', imgSrc: wp },
			e2: { type: 'pawn', color: 'white', imgSrc: wp },
			f2: { type: 'pawn', color: 'white', imgSrc: wp },
			g2: { type: 'pawn', color: 'white', imgSrc: wp },
			h2: { type: 'pawn', color: 'white', imgSrc: wp },
			a8: { type: 'rook', color: 'black', imgSrc: br },
			b8: { type: 'knight', color: 'black', imgSrc: bn },
			c8: { type: 'bishop', color: 'black', imgSrc: bb },
			d8: { type: 'queen', color: 'black', imgSrc: bq },
			e8: { type: 'king', color: 'black', imgSrc: bk },
			f8: { type: 'bishop', color: 'black', imgSrc: bb },
			g8: { type: 'knight', color: 'black', imgSrc: bn },
			h8: { type: 'rook', color: 'black', imgSrc: br },
			a7: { type: 'pawn', color: 'black', imgSrc: bp },
			b7: { type: 'pawn', color: 'black', imgSrc: bp },
			c7: { type: 'pawn', color: 'black', imgSrc: bp },
			d7: { type: 'pawn', color: 'black', imgSrc: bp },
			e7: { type: 'pawn', color: 'black', imgSrc: bp },
			f7: { type: 'pawn', color: 'black', imgSrc: bp },
			g7: { type: 'pawn', color: 'black', imgSrc: bp },
			h7: { type: 'pawn', color: 'black', imgSrc: bp }
		};

		return pieceMap[squareName];
	}

	function getSquareColor(rowIndex: number, colIndex: number): 'light' | 'dark' {
		return (rowIndex + colIndex) % 2 === 0 ? 'light' : 'dark';
	}

	function handleSquareClick(squareName: string) {
		if (selectedSquare === squareName) {
			selectedSquare = null;
		} else {
			selectedSquare = squareName;
		}
	}

	// Find tile by square name
	function findTile(squareName: string): Tile | undefined {
		for (const row of board) {
			const tile = row.find((t) => t.squareName === squareName);
			if (tile) return tile;
		}
		return undefined;
	}

	// Move piece from one square to another
	function movePiece(from: string, to: string) {
		const fromTile = findTile(from);
		const toTile = findTile(to);

		if (fromTile && toTile && fromTile.piece) {
			// Move the piece
			toTile.piece = fromTile.piece;
			fromTile.piece = undefined;

			// Clear selection
			selectedSquare = null;
			draggedFrom = null;
		}
	}

	// Drag handlers
	function handleDragStart(squareName: string) {
		const tile = findTile(squareName);
		if (tile?.piece) {
			draggedFrom = squareName;
			selectedSquare = squareName;
		}
	}

	function handleDrop(squareName: string) {
		if (draggedFrom && draggedFrom !== squareName) {
			movePiece(draggedFrom, squareName);
		}
		draggedFrom = null;
	}

	// Initialize board
	let board = $state(initializeBoard());

	function handleReload() {
		board = initializeBoard();
		selectedSquare = null;
		draggedFrom = null;
	}
</script>

<div class="chess-board">
	{#each board as row, rowIndex}
		<div class="flex">
			{#each row as tile, colIndex}
				<Square
					{tile}
					color={getSquareColor(rowIndex, colIndex)}
					{squareSize}
					onTileClick={() => handleSquareClick(tile.squareName)}
					isClicked={selectedSquare === tile.squareName}
					clickedColor="yellow"
					onDragStart={() => handleDragStart(tile.squareName)}
					onDrop={() => handleDrop(tile.squareName)}
				/>
			{/each}
		</div>
	{/each}
</div>
<button onclick={handleReload} class="px-3 py-1 bg-gray-600 text-white rounded-md cursor-pointer hover:bg-gray-800 transition-colors">
	Replay 🔄
</button>

<style>
	.chess-board {
		display: inline-block;
		border: 2px solid #333;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
</style>
