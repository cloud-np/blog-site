<script lang="ts">
    import { onMount, type Snippet } from 'svelte';

    let isExpanded = $state(false);
	const tasks = $state([
		{ id: 1, compCost: 67, cummnicationCost: 78 },
		{ id: 2, compCost: 74, cummnicationCost: 98 },
		{ id: 3, compCost: 87, cummnicationCost: 99 },
		{ id: 4, compCost: 90, cummnicationCost: 0 },
	]);
	const processorsPower = [1, 2];

	// Define timeline scale (0-200 units)
	const timelineMax = 200;

	// P1 tasks: [start, end, isOpen]
	const p1Tasks = [
		{ start: 0, end: 23, isOpen: true },
		{ start: 25, end: 55, isOpen: false },
		{ start: 90, end: 106, isOpen: false },
		{ start: 132, end: 142, isOpen: true },
		{ start: 150, end: 168, isOpen: false },
	];

	// P2 tasks: [start, end, isOpen]
	const p2Tasks = [
		{ start: 0, end: 20, isOpen: false },
		{ start: 20, end: 50, isOpen: false },
		{ start: 54, end: 70, isOpen: true },
		{ start: 73, end: 90, isOpen: false },
		{ start: 100, end: 104, isOpen: false },
		{ start: 104, end: 120, isOpen: true },
		{ start: 125, end: 142, isOpen: false }
	];

	// Convert timeline units to percentages
	function getPercentage(value: number): number {
		return (value / timelineMax) * 100;
	}

	function getWidth(start: number, end: number): number {
		return getPercentage(end - start);
	}

	function getLeft(start: number): number {
		return getPercentage(start);
	}
</script>

<style>

	.timeline {
		max-width: 100%;
	}

	.task.open {
		background-color: #53edeb;
		border: 1px solid #a9fcf3;
	}

	.task {
		background-color: #4b5563; /* bg-gray-600 */
		border-radius: 0.5rem;
		height: 2rem;
		position: absolute;
		border: 1px solid #9ca3af; /* border-gray-400 */
	}

	.task-p1 {
		top: 2.5rem;
	}

	.task-p2 {
		top: 5.25rem;
	}

	.arrow {
		width: 120px;
		position: absolute;
	}

	.line {
		margin-top: 4px;
		width: 90px;
		background: white;
		height: 1px;
		float: left;
	}

	.point {
		border-top: 4px solid transparent;
		border-bottom: 4px solid transparent;
		border-left: 8px solid white;
		float: left;
	}
</style>

<div class="w-full h-100 flex flex-col justify-center">
	<h1 class="font-bold text-xl">Small Demo</h1>
	<div class="timeline ml-9 flex relative justify-between border-b border-gray-500">
		<span>0</span>
		<span>50</span>
		<span>100</span>
		<span>150</span>
		<span>200</span>

		<!-- P1 Tasks -->
		{#each p1Tasks as task, i}
			<div
				class="task task-p1 {task.isOpen ? 'open' : ''}"
				style="left: {getLeft(task.start)}%; width: {getWidth(task.start, task.end)}%;"
			>
				<div class={`arrow z-10 ${!task.isOpen && 'hidden'}`}
					style="left: 101%; top: 30%;"
				>
					<div class="line"></div>
					<div class="point"></div>
				</div>
			</div>
		{/each}


		<!-- P2 Tasks -->
		{#each p2Tasks as task, i}
			<div
				class="task task-p2 {task.isOpen ? 'open' : ''}"
				style="left: {getLeft(task.start)}%; width: {getWidth(task.start, task.end)}%;"
			></div>
		{/each}
	</div>
	<div class="mt-4 flex flex-col gap-3.5 justify-center">
		<div class="flex w-full items-center">
			<p class="mr-2 w-7 font-bold">P-1</p>
			<div class="border flex-1 h-7.5 border-dashed rounded-lg border-gray-500"></div>
		</div>

		<div class="flex w-full items-center">
			<p class="mr-2 w-7 font-bold">P-2</p>
			<div class="border flex-1 h-7.5 border-dashed rounded-lg border-gray-500"></div>
		</div>
	</div>
	<div class="flex gap-4">
		<button>
			Save
		</button>
		<button>
			Save
		</button>
	</div>
</div>
