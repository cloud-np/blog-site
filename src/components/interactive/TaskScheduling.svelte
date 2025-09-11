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
	const holesP1 = [
		[0, 37,5],
		[87,5, 156,5],
		[176,5, 270],
	];
	const holesP2 = [
		[80,5, 119,5],
		[131.5, 150],
		[152, 174.5],
	];
</script>

<style>

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
</style>

<div class="w-full h-100">
	<div class="timeline ml-9 flex relative justify-between border-b border-gray-500">
		<span>0</span>
		<span>50</span>
		<span>100</span>
		<span>150</span>
		<span>200</span>
		<!-- P1 -->
		<div class="w-10 task task-p1 open"></div>
		<div class="translate-x-30 w-20 task task-p1"></div>
		<div class="translate-x-50 w-20 task task-p1 open"></div>
		<div class="translate-x-83 w-12 task task-p1"></div>
		<div class="translate-x-130 w-12 task task-p1"></div>

		<!-- P2 -->
		<div class="w-20 task task-p2"></div>
		<div class="translate-x-20 w-20 task task-p2"></div>
		<div class="translate-x-60 w-10 task task-p2"></div>
		<div class="translate-x-77 w-3 task task-p2"></div>
		<div class="translate-x-95 w-10 task task-p2"></div>
	</div>
	<div class="mt-4 flex flex-col gap-3.5 justify-center">
		<div class="flex w-full items-center">
			<p class="mr-2 w-7">P-1</p>
			<div class="border flex-1 h-7.5 border-dashed rounded-lg border-gray-500"></div>
		</div>

		<div class="flex w-full items-center">
			<p class="mr-2 w-7">P-2</p>
			<div class="border flex-1 h-7.5 border-dashed rounded-lg border-gray-500"></div>
		</div>
	</div>
</div>
