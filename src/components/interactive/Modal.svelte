<script lang="ts">
	let { open = $bindable(false), onclose, children }: { open?: boolean; onclose?: () => void; children?: import('svelte').Snippet } = $props();

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) onclose?.();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && open) onclose?.();
	}

	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			},
		};
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div class="fixed inset-0 z-50 overflow-y-auto backdrop-open" use:portal>
		<div
			class="flex min-h-full items-center justify-center p-4"
			onclick={handleBackdropClick}
		>
			<div class="modal-card">
				{@render children?.()}
			</div>
		</div>
	</div>
{/if}

<style>
	.backdrop-open {
		background: rgba(0, 0, 0, 0.6);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		animation: fade-in 0.2s ease-out;
	}

	.modal-card {
		animation: scale-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes scale-in {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(10px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}
</style>
