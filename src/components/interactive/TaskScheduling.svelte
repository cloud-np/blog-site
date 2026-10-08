<script lang="ts">
	import { onMount } from "svelte";

	type ProcessorId = "P1" | "P2";

	interface Span {
		start: number;
		end: number;
	}

	interface WorkflowTask extends Span {
		id: number;
		processor: ProcessorId;
		compCost: number;
		communicationCost: number;
		child: number | null;
	}

	type Tip =
		| { kind: "task"; task: WorkflowTask }
		| { kind: "busy"; processor: ProcessorId; span: Span }
		| { kind: "pocket"; processor: ProcessorId; span: Span };

	const TIMELINE_MAX = 200;
	const TICKS = [0, 50, 100, 150, 200];
	const STEP_MS = 900;

	// Slots already reserved on each processor by other workflows.
	const busy: Record<ProcessorId, Span[]> = {
		P1: [
			{ start: 25, end: 55 },
			{ start: 90, end: 106 },
			{ start: 150, end: 168 },
		],
		P2: [
			{ start: 0, end: 20 },
			{ start: 20, end: 50 },
			{ start: 73, end: 90 },
			{ start: 100, end: 104 },
			{ start: 125, end: 142 },
		],
	};

	// The new workflow, in the order EFT schedules it.
	const workflow: WorkflowTask[] = [
		{ id: 1, processor: "P1", start: 0, end: 23, compCost: 67, communicationCost: 78, child: 2 },
		{ id: 2, processor: "P2", start: 54, end: 70, compCost: 74, communicationCost: 98, child: 3 },
		{ id: 3, processor: "P1", start: 132, end: 142, compCost: 87, communicationCost: 99, child: 4 },
		{ id: 4, processor: "P2", start: 104, end: 120, compCost: 90, communicationCost: 0, child: null },
	];

	const processors: ProcessorId[] = ["P1", "P2"];

	/** Idle gaps between the reserved slots: the "pockets" the workflow is packed into. */
	function findPockets(spans: Span[]): Span[] {
		const pockets: Span[] = [];
		let cursor = 0;
		for (const span of [...spans].sort((a, b) => a.start - b.start)) {
			if (span.start > cursor) pockets.push({ start: cursor, end: span.start });
			cursor = Math.max(cursor, span.end);
		}
		if (cursor < TIMELINE_MAX) pockets.push({ start: cursor, end: TIMELINE_MAX });
		return pockets;
	}

	const pockets: Record<ProcessorId, Span[]> = {
		P1: findPockets(busy.P1),
		P2: findPockets(busy.P2),
	};

	function pocketFor(task: WorkflowTask): Span | undefined {
		return pockets[task.processor].find(p => p.start <= task.start && p.end >= task.end);
	}

	const makespan = Math.max(...workflow.map(t => t.end));

	let root: HTMLDivElement;
	let placed = $state(0);
	let activeId = $state<number | null>(null);
	let running = $state(false);
	let tip = $state<(Tip & { x: number; y: number }) | null>(null);
	let timers: ReturnType<typeof setTimeout>[] = [];

	const activeTask = $derived(workflow.find(t => t.id === activeId) ?? null);
	const activePocket = $derived(activeTask ? pocketFor(activeTask) : undefined);
	const status = $derived.by(() => {
		if (activeTask && activePocket) {
			return `Packing T${activeTask.id} into ${activeTask.processor} · idle slot ${activePocket.start}–${activePocket.end}`;
		}
		if (placed === workflow.length) return `Workflow packed · makespan ${makespan}`;
		return "Earliest Finish Time · best-fit packing";
	});

	const pct = (value: number) => (value / TIMELINE_MAX) * 100;
	const spanStyle = (span: Span) => `left: ${pct(span.start)}%; width: ${pct(span.end - span.start)}%;`;

	function clearTimers() {
		timers.forEach(clearTimeout);
		timers = [];
	}

	function play() {
		clearTimers();
		tip = null;
		placed = 0;
		activeId = null;
		running = true;

		workflow.forEach((task, i) => {
			const at = 350 + i * STEP_MS;
			timers.push(setTimeout(() => (activeId = task.id), at));
			timers.push(setTimeout(() => (placed = i + 1), at + STEP_MS * 0.5));
		});
		timers.push(
			setTimeout(
				() => {
					activeId = null;
					running = false;
				},
				350 + workflow.length * STEP_MS
			)
		);
	}

	function showTip(target: HTMLElement, content: Tip) {
		const rect = target.getBoundingClientRect();
		const rootRect = root.getBoundingClientRect();
		const half = 104;
		const x = Math.min(Math.max(rect.left + rect.width / 2 - rootRect.left, half), rootRect.width - half);
		tip = { ...content, x, y: rect.bottom - rootRect.top + 8 };
	}

	function handleHover(event: MouseEvent) {
		const target = (event.target as HTMLElement).closest<HTMLElement>("[data-tip]");
		if (!target) {
			tip = null;
			return;
		}
		const [kind, processor, index] = (target.dataset.tip ?? "").split(":") as [Tip["kind"], ProcessorId, string];
		const i = Number(index);
		if (kind === "task") showTip(target, { kind, task: workflow[i] });
		else if (kind === "busy") showTip(target, { kind, processor, span: busy[processor][i] });
		else if (kind === "pocket") showTip(target, { kind, processor, span: pockets[processor][i] });
	}

	onMount(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			placed = workflow.length;
			return clearTimers;
		}

		const observer = new IntersectionObserver(
			entries => {
				if (entries.some(e => e.isIntersecting)) {
					observer.disconnect();
					play();
				}
			},
			{ threshold: 0.5 }
		);
		observer.observe(root);

		return () => {
			observer.disconnect();
			clearTimers();
		};
	});
</script>

<div class="scheduler relative w-full py-2" bind:this={root}>
	<div class="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-neutral-400">
		<span class="flex items-center gap-1.5"><i class="swatch swatch-busy"></i>Other workflows</span>
		<span class="flex items-center gap-1.5"><i class="swatch swatch-wf"></i>New workflow</span>
		<span class="flex items-center gap-1.5"><i class="swatch swatch-pocket"></i>Idle slot</span>
	</div>

	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="chart" onmouseover={handleHover} onmouseleave={() => (tip = null)} onfocusout={() => (tip = null)}>
		<div class="axis" aria-hidden="true">
			{#each TICKS as tick}
				<span class="tick" style="left: {pct(tick)}%">{tick}</span>
			{/each}
		</div>

		{#each processors as processor}
			<div class="lane-row">
				<span class="lane-label">{processor}</span>
				<div class="lane">
					{#each pockets[processor] as pocket, i}
						<div
							class="pocket"
							class:target={activePocket === pocket}
							style={spanStyle(pocket)}
							data-tip="pocket:{processor}:{i}">
						</div>
					{/each}

					{#each busy[processor] as span, i}
						<div class="task busy" style={spanStyle(span)} data-tip="busy:{processor}:{i}"></div>
					{/each}

					{#each workflow as task, i}
						{#if task.processor === processor && i < placed}
							<button
								type="button"
								class="task wf"
								style={spanStyle(task)}
								data-tip="task:{processor}:{i}"
								aria-label="Task {task.id} on {processor}, from {task.start} to {task.end}"
								onfocus={e => showTip(e.currentTarget, { kind: "task", task })}>
								<span>T{task.id}</span>
							</button>
						{/if}
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<div class="mt-5 flex items-center gap-3">
		<button
			type="button"
			onclick={play}
			disabled={running}
			class="replay flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white disabled:cursor-default disabled:opacity-60">
			<svg class:spinning={running} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
				<path
					d="M20 12a8 8 0 1 1-2.34-5.66M20 4v4.5h-4.5"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round" />
			</svg>
			Replay
		</button>
		<p class="status text-xs text-neutral-400" aria-live="polite">{status}</p>
	</div>

	{#if tip}
		<div class="tooltip" style="left: {tip.x}px; top: {tip.y}px;" role="tooltip">
			{#if tip.kind === "task"}
				<div class="mb-1.5 flex items-center gap-2 text-[13px] font-semibold text-white">
					<i class="swatch swatch-wf"></i>Task {tip.task.id} · {tip.task.processor}
				</div>
				<dl>
					<dt>Runs</dt>
					<dd>{tip.task.start} → {tip.task.end}</dd>
					<dt>Duration</dt>
					<dd>{tip.task.end - tip.task.start} units</dd>
					<dt>Computation</dt>
					<dd>{tip.task.compCost}</dd>
					<dt>Communication</dt>
					<dd>{tip.task.communicationCost}</dd>
					<dt>Child task</dt>
					<dd>{tip.task.child ? `T${tip.task.child}` : "None"}</dd>
				</dl>
			{:else if tip.kind === "busy"}
				<div class="mb-1 flex items-center gap-2 text-[13px] font-semibold text-white">
					<i class="swatch swatch-busy"></i>Reserved · {tip.processor}
				</div>
				<p class="text-neutral-400">
					{tip.span.start} → {tip.span.end}, used by another workflow.
				</p>
			{:else}
				<div class="mb-1 flex items-center gap-2 text-[13px] font-semibold text-white">
					<i class="swatch swatch-pocket"></i>Idle slot · {tip.processor}
				</div>
				<p class="text-neutral-400">
					{tip.span.start} → {tip.span.end} <span class="muted">({tip.span.end - tip.span.start} units free)</span>
				</p>
			{/if}
		</div>
	{/if}
</div>

<style>
	.chart {
		--label-width: 2rem;
		position: relative;
	}

	.axis {
		position: relative;
		height: 1.25rem;
		margin-left: var(--label-width);
		margin-bottom: 0.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.12);
		font-size: 11px;
		color: rgb(163 163 163);
		font-variant-numeric: tabular-nums;
	}

	.tick {
		position: absolute;
		top: 0;
		transform: translateX(-50%);
	}

	.tick:first-child {
		transform: none;
	}

	.tick:last-child {
		transform: translateX(-100%);
	}

	.lane-row {
		display: flex;
		align-items: center;
		height: 2rem;
	}

	.lane-row + .lane-row {
		margin-top: 0.625rem;
	}

	.lane-label {
		width: var(--label-width);
		flex-shrink: 0;
		font-size: 12px;
		font-weight: 700;
		color: rgb(212 212 212);
	}

	.lane {
		position: relative;
		flex: 1;
		height: 100%;
		border-radius: 0.5rem;
		background-color: rgba(255, 255, 255, 0.015);
		background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
		background-size: 25% 100%;
	}

	.pocket,
	.task {
		position: absolute;
		top: 0;
		height: 100%;
		border-radius: 0.45rem;
	}

	.pocket {
		border: 1px dashed rgba(148, 163, 184, 0.28);
		background: repeating-linear-gradient(
			-45deg,
			rgba(148, 163, 184, 0.05) 0 4px,
			transparent 4px 8px
		);
		transition:
			border-color 0.3s ease,
			background-color 0.3s ease,
			box-shadow 0.3s ease;
	}

	.pocket:hover {
		border-color: rgba(148, 163, 184, 0.55);
	}

	.pocket.target {
		border-color: rgba(83, 237, 235, 0.9);
		background-color: rgba(83, 237, 235, 0.1);
		box-shadow:
			0 0 18px rgba(83, 237, 235, 0.35),
			inset 0 0 12px rgba(83, 237, 235, 0.2);
		animation: pocket-pulse 0.9s ease-in-out infinite;
	}

	.task.busy {
		background: linear-gradient(180deg, #4b5563, #374151);
		border: 1px solid rgba(156, 163, 175, 0.6);
		transition: border-color 0.2s ease;
	}

	.task.busy:hover {
		border-color: rgba(209, 213, 219, 0.9);
	}

	.task.wf {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		border: 1px solid #a9fcf3;
		background: linear-gradient(180deg, #6ff5f2, #2fd3d6);
		color: #042f33;
		font-size: 10px;
		font-weight: 700;
		cursor: pointer;
		z-index: 2;
		box-shadow: 0 0 14px rgba(83, 237, 235, 0.35);
		animation: drop-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
		transition:
			box-shadow 0.2s ease,
			transform 0.2s ease;
	}

	.task.wf span {
		overflow: hidden;
	}

	.task.wf:hover,
	.task.wf:focus-visible {
		outline: none;
		transform: translateY(-2px);
		box-shadow:
			0 0 0 2px rgba(169, 252, 243, 0.5),
			0 6px 22px rgba(83, 237, 235, 0.5);
	}

	.swatch {
		display: inline-block;
		width: 10px;
		height: 10px;
		border-radius: 3px;
	}

	.swatch-busy {
		background: #4b5563;
		border: 1px solid #9ca3af;
	}

	.swatch-wf {
		background: #53edeb;
		border: 1px solid #a9fcf3;
		box-shadow: 0 0 6px rgba(83, 237, 235, 0.6);
	}

	.swatch-pocket {
		border: 1px dashed rgba(148, 163, 184, 0.6);
	}

	.tooltip {
		position: absolute;
		z-index: 20;
		width: 208px;
		transform: translateX(-50%);
		padding: 0.625rem 0.75rem;
		border-radius: 0.625rem;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(10, 13, 24, 0.94);
		box-shadow:
			0 12px 32px rgba(0, 0, 0, 0.5),
			0 0 0 1px rgba(83, 237, 235, 0.06);
		font-family: var(--f-sans);
		font-size: 12px;
		pointer-events: none;
		animation: tooltip-in 0.15s ease-out;
	}

	.tooltip dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.15rem 0.75rem;
		margin: 0;
	}

	.tooltip dt {
		color: rgb(163 163 163);
	}

	.tooltip dd {
		margin: 0;
		color: #e5e7eb;
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.muted {
		color: rgb(115 115 115);
	}

	.status {
		min-height: 1rem;
	}

	.spinning {
		animation: spin 0.9s linear infinite;
	}

	@keyframes drop-in {
		0% {
			opacity: 0;
			transform: translateY(-28px) scale(0.85);
		}
		60% {
			opacity: 1;
		}
		100% {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes pocket-pulse {
		50% {
			box-shadow:
				0 0 26px rgba(83, 237, 235, 0.5),
				inset 0 0 16px rgba(83, 237, 235, 0.3);
		}
	}

	@keyframes tooltip-in {
		from {
			opacity: 0;
			transform: translate(-50%, -4px);
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.task.wf,
		.pocket.target,
		.tooltip,
		.spinning {
			animation: none;
		}
	}
</style>
