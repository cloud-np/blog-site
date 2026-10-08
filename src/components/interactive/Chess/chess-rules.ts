/**
 * Minimal chess rules for the landing page board.
 *
 * Squares are indexed 0..63 with 0 = a8 (top-left from White's side) and 63 = h1.
 * Covers legal move generation (including check), castling, en passant and
 * auto-promotion to a queen. Draw rules beyond stalemate are out of scope.
 */

export type PieceType = "k" | "q" | "r" | "b" | "n" | "p";
export type Color = "w" | "b";

export interface Piece {
	id: number;
	type: PieceType;
	color: Color;
	square: number;
}

export interface Move {
	from: number;
	to: number;
	/** Square of the captured piece (differs from `to` for en passant). */
	capture?: number;
	promotion?: PieceType;
	castle?: { rookFrom: number; rookTo: number };
	doublePush?: boolean;
}

export interface GameState {
	pieces: Piece[];
	turn: Color;
	castling: { wk: boolean; wq: boolean; bk: boolean; bq: boolean };
	/** Square a pawn can capture onto en passant this turn. */
	epSquare: number | null;
}

export type GameStatus = "playing" | "check" | "checkmate" | "stalemate";

type Grid = (Piece | undefined)[];

const BACK_RANK: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
const KNIGHT_STEPS = [
	[-2, -1],
	[-2, 1],
	[-1, -2],
	[-1, 2],
	[1, -2],
	[1, 2],
	[2, -1],
	[2, 1],
];
const KING_STEPS = [
	[-1, -1],
	[-1, 0],
	[-1, 1],
	[0, -1],
	[0, 1],
	[1, -1],
	[1, 0],
	[1, 1],
];
const ROOK_DIRS = [
	[-1, 0],
	[1, 0],
	[0, -1],
	[0, 1],
];
const BISHOP_DIRS = [
	[-1, -1],
	[-1, 1],
	[1, -1],
	[1, 1],
];

const rowOf = (square: number) => square >> 3;
const colOf = (square: number) => square & 7;
const toSquare = (row: number, col: number) => row * 8 + col;
const onBoard = (row: number, col: number) => row >= 0 && row < 8 && col >= 0 && col < 8;
const enemy = (color: Color): Color => (color === "w" ? "b" : "w");

export const FILES = "abcdefgh";
export const squareName = (square: number) => `${FILES[colOf(square)]}${8 - rowOf(square)}`;

export function initialState(): GameState {
	const pieces: Piece[] = [];
	let id = 0;
	for (let col = 0; col < 8; col++) {
		pieces.push({ id: id++, type: BACK_RANK[col], color: "b", square: toSquare(0, col) });
		pieces.push({ id: id++, type: "p", color: "b", square: toSquare(1, col) });
		pieces.push({ id: id++, type: "p", color: "w", square: toSquare(6, col) });
		pieces.push({ id: id++, type: BACK_RANK[col], color: "w", square: toSquare(7, col) });
	}
	return { pieces, turn: "w", castling: { wk: true, wq: true, bk: true, bq: true }, epSquare: null };
}

export function toGrid(pieces: Piece[]): Grid {
	const grid: Grid = new Array(64);
	for (const piece of pieces) grid[piece.square] = piece;
	return grid;
}

function isAttacked(grid: Grid, square: number, by: Color): boolean {
	const row = rowOf(square);
	const col = colOf(square);
	const isPiece = (r: number, c: number, types: PieceType[]) => {
		const piece = grid[toSquare(r, c)];
		return !!piece && piece.color === by && types.includes(piece.type);
	};

	// White pawns attack upwards, so they sit one row below the attacked square.
	const pawnRow = by === "w" ? row + 1 : row - 1;
	for (const dc of [-1, 1]) {
		if (onBoard(pawnRow, col + dc) && isPiece(pawnRow, col + dc, ["p"])) return true;
	}
	for (const [dr, dc] of KNIGHT_STEPS) {
		if (onBoard(row + dr, col + dc) && isPiece(row + dr, col + dc, ["n"])) return true;
	}
	for (const [dr, dc] of KING_STEPS) {
		if (onBoard(row + dr, col + dc) && isPiece(row + dr, col + dc, ["k"])) return true;
	}
	const slides: [number[][], PieceType[]][] = [
		[ROOK_DIRS, ["r", "q"]],
		[BISHOP_DIRS, ["b", "q"]],
	];
	for (const [dirs, types] of slides) {
		for (const [dr, dc] of dirs) {
			let r = row + dr;
			let c = col + dc;
			while (onBoard(r, c)) {
				const piece = grid[toSquare(r, c)];
				if (piece) {
					if (piece.color === by && types.includes(piece.type)) return true;
					break;
				}
				r += dr;
				c += dc;
			}
		}
	}
	return false;
}

function pseudoMoves(state: GameState, grid: Grid, from: number): Move[] {
	const piece = grid[from];
	if (!piece) return [];
	const row = rowOf(from);
	const col = colOf(from);
	const moves: Move[] = [];

	const addStep = (r: number, c: number) => {
		if (!onBoard(r, c)) return false;
		const to = toSquare(r, c);
		const target = grid[to];
		if (!target) {
			moves.push({ from, to });
			return true;
		}
		if (target.color !== piece.color) moves.push({ from, to, capture: to });
		return false;
	};

	switch (piece.type) {
		case "p": {
			const dir = piece.color === "w" ? -1 : 1;
			const startRow = piece.color === "w" ? 6 : 1;
			const lastRow = piece.color === "w" ? 0 : 7;
			const nextRow = row + dir;
			const promotion = nextRow === lastRow ? ("q" as const) : undefined;

			if (onBoard(nextRow, col) && !grid[toSquare(nextRow, col)]) {
				moves.push({ from, to: toSquare(nextRow, col), promotion });
				const jumpRow = row + dir * 2;
				if (row === startRow && !grid[toSquare(jumpRow, col)]) {
					moves.push({ from, to: toSquare(jumpRow, col), doublePush: true });
				}
			}
			for (const dc of [-1, 1]) {
				if (!onBoard(nextRow, col + dc)) continue;
				const to = toSquare(nextRow, col + dc);
				const target = grid[to];
				if (target && target.color !== piece.color) moves.push({ from, to, capture: to, promotion });
				else if (to === state.epSquare) moves.push({ from, to, capture: toSquare(row, col + dc) });
			}
			break;
		}
		case "n":
			for (const [dr, dc] of KNIGHT_STEPS) addStep(row + dr, col + dc);
			break;
		case "k": {
			for (const [dr, dc] of KING_STEPS) addStep(row + dr, col + dc);

			const opponent = enemy(piece.color);
			const home = piece.color === "w" ? 60 : 4;
			const rights =
				piece.color === "w"
					? { king: state.castling.wk, queen: state.castling.wq }
					: { king: state.castling.bk, queen: state.castling.bq };
			if (from !== home || isAttacked(grid, from, opponent)) break;

			const rookAt = (square: number) => {
				const rook = grid[square];
				return !!rook && rook.type === "r" && rook.color === piece.color;
			};
			if (
				rights.king &&
				rookAt(from + 3) &&
				!grid[from + 1] &&
				!grid[from + 2] &&
				!isAttacked(grid, from + 1, opponent) &&
				!isAttacked(grid, from + 2, opponent)
			) {
				moves.push({ from, to: from + 2, castle: { rookFrom: from + 3, rookTo: from + 1 } });
			}
			if (
				rights.queen &&
				rookAt(from - 4) &&
				!grid[from - 1] &&
				!grid[from - 2] &&
				!grid[from - 3] &&
				!isAttacked(grid, from - 1, opponent) &&
				!isAttacked(grid, from - 2, opponent)
			) {
				moves.push({ from, to: from - 2, castle: { rookFrom: from - 4, rookTo: from - 1 } });
			}
			break;
		}
		default: {
			const dirs =
				piece.type === "r" ? ROOK_DIRS : piece.type === "b" ? BISHOP_DIRS : [...ROOK_DIRS, ...BISHOP_DIRS];
			for (const [dr, dc] of dirs) {
				let r = row + dr;
				let c = col + dc;
				while (addStep(r, c)) {
					r += dr;
					c += dc;
				}
			}
		}
	}

	return moves;
}

export function applyMove(state: GameState, move: Move): GameState {
	const pieces = state.pieces.filter(p => p.square !== move.capture).map(p => ({ ...p }));
	const moving = pieces.find(p => p.square === move.from);
	if (!moving) return state;

	moving.square = move.to;
	if (move.promotion) moving.type = move.promotion;
	if (move.castle) {
		const rook = pieces.find(p => p.square === move.castle!.rookFrom);
		if (rook) rook.square = move.castle.rookTo;
	}

	const castling = { ...state.castling };
	if (moving.type === "k") {
		if (moving.color === "w") castling.wk = castling.wq = false;
		else castling.bk = castling.bq = false;
	}
	// Moving a rook, or capturing one, removes that side's castling right.
	for (const square of [move.from, move.to]) {
		if (square === 63) castling.wk = false;
		if (square === 56) castling.wq = false;
		if (square === 7) castling.bk = false;
		if (square === 0) castling.bq = false;
	}

	return {
		pieces,
		turn: enemy(state.turn),
		castling,
		epSquare: move.doublePush ? (move.from + move.to) / 2 : null,
	};
}

function kingSquare(pieces: Piece[], color: Color): number {
	return pieces.find(p => p.type === "k" && p.color === color)?.square ?? -1;
}

export function legalMoves(state: GameState, from: number): Move[] {
	const grid = toGrid(state.pieces);
	const piece = grid[from];
	if (!piece || piece.color !== state.turn) return [];

	return pseudoMoves(state, grid, from).filter(move => {
		const next = applyMove(state, move);
		return !isAttacked(toGrid(next.pieces), kingSquare(next.pieces, piece.color), next.turn);
	});
}

export function inCheck(state: GameState): boolean {
	return isAttacked(toGrid(state.pieces), kingSquare(state.pieces, state.turn), enemy(state.turn));
}

export function gameStatus(state: GameState): GameStatus {
	const hasMoves = state.pieces.some(p => p.color === state.turn && legalMoves(state, p.square).length > 0);
	const check = inCheck(state);
	if (!hasMoves) return check ? "checkmate" : "stalemate";
	return check ? "check" : "playing";
}

export function checkedKingSquare(state: GameState): number | null {
	return inCheck(state) ? kingSquare(state.pieces, state.turn) : null;
}
