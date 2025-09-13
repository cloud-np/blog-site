<script lang="ts">
	import { onMount, type Snippet } from "svelte";

	type TaskId = number;
	type ProcessorId = number;

	interface Task {
		id: TaskId;
		compCost: number;
		communicationCost: number;
		start: number;
		end: number;
		child: TaskId; // later will be children
		processor: ProcessorId;
	};

	let isExpanded = $state(false);
	let hoveredTask: Task | null = $state(null);
	let popoverPosition = $state({ x: 0, y: 0 });
	let isReloading = $state(false);

	const tasks = $state([
		{ id: 1, compCost: 67, communicationCost: 78 },
		{ id: 2, compCost: 74, communicationCost: 98 },
		{ id: 3, compCost: 87, communicationCost: 99 },
		{ id: 4, compCost: 90, communicationCost: 0 },
	]);

	// Define timeline scale (0-200 units)
	const timelineMax = 200;

	// P1 tasks: [start, end, isOpen]
	const p1Tasks = [
		{ start: 0, end: 23, id: 1, child: 2 },
		{ start: 25, end: 55 },
		{ start: 90, end: 106 },
		{ start: 132, end: 142, id: 3, child: 4 },
		{ start: 150, end: 168 },
	];

	// P2 tasks: [start, end, isOpen]
	const p2Tasks = [
		{ start: 0, end: 20 },
		{ start: 20, end: 50 },
		{ start: 54, end: 70, id: 2, child: 3 },
		{ start: 73, end: 90 },
		{ start: 100, end: 104 },
		{ start: 104, end: 120, id: 4, child: -1 },
		{ start: 125, end: 142 },
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

	function getTaskInfo(taskId: number) {
		return tasks.find(task => task.id === taskId);
	}

	function handleMouseEnter(event: MouseEvent, task: any, processor: string) {
		if (task.id) {
			hoveredTask = { ...task, processor };
			const rect = (event.target as HTMLElement).getBoundingClientRect();
			popoverPosition = { x: rect.right + 10, y: rect.top };
		}
	}

	function handleMouseLeave() {
		hoveredTask = null;
	}

	function hover(): number {
		return 0;
	}

	function handleReload() {
		isReloading = true;
		// Reset animation after it completes (4 tasks * 200ms delay + 300ms animation = ~1.1s)
		setTimeout(() => {
			isReloading = false;
		}, 1200);
	}

	// Get animation delay for tasks with IDs based on their order
	function getAnimationDelay(taskId: number | undefined): number {
		if (!taskId || !isReloading) return 0;
		// Task IDs are 1, 2, 3, 4 - so delay is (id - 1) * 200ms
		return (taskId - 1) * 200;
	}

</script>

<div class="w-full h-78 flex flex-col justify-center">
	<div class="timeline ml-9 flex relative justify-between border-b border-gray-500">
		<span>0</span>
		<span>50</span>
		<span>100</span>
		<span>150</span>
		<span>200</span>

		<!-- P1 Tasks -->
		{#each p1Tasks as task, i}
			<button
				aria-label={"Task-" + i}
				class="task task-p1 {!!task.id && 'open'} {task.id && isReloading ? 'loading' : ''}"
				style="left: {getLeft(task.start)}%; width: {getWidth(task.start, task.end)}%; {task.id ? `animation-delay: ${getAnimationDelay(task.id)}ms;` : ''}"
				onmouseenter={(e) => handleMouseEnter(e, task, 'P1')}
				onmouseleave={handleMouseLeave}>
			</button>
		{/each}

		<!-- P2 Tasks -->
		{#each p2Tasks as task, i}
			<div
				role="tooltip"
				class="task task-p2 {!!task.id && 'open'} {task.id && isReloading ? 'loading' : ''}"
				style="left: {getLeft(task.start)}%; width: {getWidth(task.start, task.end)}%; {task.id ? `animation-delay: ${getAnimationDelay(task.id)}ms;` : ''}"
				onmouseenter={(e) => handleMouseEnter(e, task, 'P2')}
				onmouseleave={handleMouseLeave}>
			</div>
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
	<div class="flex gap-4 mt-5">
		<button onclick={handleReload} class="px-3 py-1 bg-gray-600 text-white rounded-md cursor-pointer hover:bg-gray-800 transition-colors">
			Replay 🔄
		</button>
		Example of EFT (Earlist Finish Time using Best fit)
	</div>

	<!-- Task Info Popover -->
	{#if hoveredTask}
		{@const taskInfo = getTaskInfo(hoveredTask.id)}
		<div
			class="fixed z-50 bg-gray-800 text-white p-3 rounded-lg shadow-lg border border-gray-600"
			style="left: {popoverPosition.x}px; top: {popoverPosition.y}px; transform: translateY(-50%);">
			<div class="text-sm font-semibold mb-2">Task {hoveredTask.id} ({hoveredTask.processor})</div>
			{#if taskInfo}
				<div class="text-xs space-y-1">
					<div>Computation Cost: <span class="font-mono">{taskInfo.compCost}</span></div>
					<div>Communication Cost: <span class="font-mono">{taskInfo.communicationCost}</span></div>
					<div>Duration: <span class="font-mono">{hoveredTask.end - hoveredTask.start}</span> units</div>
					<div>Start: <span class="font-mono">{hoveredTask.start}</span></div>
					<div>End: <span class="font-mono">{hoveredTask.end}</span></div>
					{#if !!hoveredTask.child}
						<div>Child Task: <span class="font-mono">{hoveredTask.child > 0 ? hoveredTask.child : 'None'}</span></div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.task-info {
		opacity: 0;
		transition: all 300ms cubic-bezier(0.19, 1, 0.22, 1);
	}
	.task-info:hover {
		opacity: 1;
	}

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
		transition: all 0.3s ease;
	}

	.task.loading {
		animation: taskLoad 0.6s ease-out forwards;
		opacity: 0;
		transform: scale(0.8) translateY(-10px);
	}

	@keyframes taskLoad {
		0% {
			opacity: 0;
			transform: scale(0.8) translateY(-10px);
			box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
		}
		50% {
			transform: scale(1.05) translateY(-5px);
			box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
		}
		100% {
			opacity: 1;
			transform: scale(1) translateY(0);
			box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
		}
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
