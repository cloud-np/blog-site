<script lang="ts">
	import { onMount } from "svelte";
	import Modal from "./Modal.svelte";

	let { url, title }: { url: string; title: string } = $props();

	let open = $state(false);
	let copied = $state(false);
	let copyTimer: ReturnType<typeof setTimeout> | undefined;

	const socials = [
		{
			name: "Facebook",
			href: `https://www.facebook.com/sharer.php?u=${encodeURIComponent(url)}`,
			brand: "#1877f2",
		},
		{
			name: "X",
			href: `https://x.com/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
			brand: "#e2e8f0",
		},
		{
			name: "Email",
			href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`,
			brand: "#14b8a6",
		},
	];

	async function trigger() {
		if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
			try {
				await navigator.share({ title, url });
				return;
			} catch (e) {
				if ((e as Error).name === "AbortError") return;
			}
		}
		open = true;
	}

	function hide() {
		open = false;
		if (copyTimer) clearTimeout(copyTimer);
		copied = false;
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			if (copyTimer) clearTimeout(copyTimer);
			copyTimer = setTimeout(() => (copied = false), 2000);
		} catch {}
	}

	onMount(() => {
		const handler = () => trigger();
		window.addEventListener("open-share-modal", handler);
		return () => window.removeEventListener("open-share-modal", handler);
	});
</script>

<Modal bind:open onclose={hide}>
	<div class="share-card">
		<button type="button" onclick={hide} class="share-close" aria-label="Close share dialog">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
				<path d="M18 6 6 18" /><path d="m6 6 12 12" />
			</svg>
		</button>

		<div class="share-header">
			<h2 class="share-title">Share this post</h2>
			<p class="share-subtitle">{title}</p>
		</div>

		<div class="share-grid">
			{#each socials as social}
				<a
					href={social.href}
					target="_blank"
					rel="noopener noreferrer"
					class="share-option"
					style="--brand: {social.brand};"
				>
					<span class="share-option__icon">
						{#if social.name === "Facebook"}
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
							</svg>
						{:else if social.name === "X"}
							<svg viewBox="0 0 24 24" fill="currentColor">
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
						{:else}
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
								<rect x="2" y="4" width="20" height="16" rx="2" />
								<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
							</svg>
						{/if}
					</span>
					<span class="share-option__label">{social.name}</span>
				</a>
			{/each}
		</div>

		<div class="share-divider"></div>

		<div class="share-link">
			<div class="share-link__url">
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
				</svg>
				<span class="share-link__text">{url}</span>
			</div>
			<button type="button" onclick={copyLink} class="share-link__btn" class:copied>
				{#if copied}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
						<path d="M20 6 9 17l-5-5" />
					</svg>
					<span>Copied</span>
				{:else}
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<rect x="9" y="9" width="13" height="13" rx="2" />
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
					</svg>
					<span>Copy</span>
				{/if}
			</button>
		</div>
	</div>
</Modal>

<style>
	.share-card {
		position: relative;
		width: min(420px, calc(100vw - 2rem));
		padding: 1.75rem 1.5rem 1.5rem;
		border-radius: 1rem;
		border: 1px solid #152040;
		background: linear-gradient(165deg, rgba(14, 22, 42, 0.95) 0%, rgba(10, 16, 32, 0.98) 100%);
		box-shadow: 0 0 80px rgba(20, 184, 166, 0.04), 0 4px 32px rgba(0, 0, 0, 0.4),
			inset 0 1px 0 rgba(255, 255, 255, 0.03);
	}

	.share-close {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		width: 2rem;
		height: 2rem;
		display: grid;
		place-items: center;
		border: none;
		border-radius: 0.5rem;
		background: transparent;
		color: #4a5568;
		cursor: pointer;
		transition: all 150ms ease;
	}
	.share-close:hover {
		color: #e2e8f0;
		background: #152040;
	}

	.share-header {
		margin-bottom: 1.25rem;
		padding-right: 2rem;
	}
	.share-title {
		margin: 0 0 0.25rem;
		font-size: 1.05rem;
		font-weight: 600;
		color: #e2e8f0;
		letter-spacing: -0.01em;
	}
	.share-subtitle {
		margin: 0;
		font-size: 0.8rem;
		color: #8494a7;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.share-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 0.5rem;
	}

	.share-option {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.9rem 0.5rem;
		border-radius: 0.75rem;
		border: 1px solid #1a2a4a;
		background: #0d1529;
		color: #8494a7;
		text-decoration: none;
		transition: all 150ms ease;
	}
	.share-option:hover {
		color: var(--brand);
		border-color: color-mix(in srgb, var(--brand) 40%, #1a2a4a);
		transform: translateY(-1px);
	}
	.share-option__icon {
		display: grid;
		place-items: center;
		width: 1.5rem;
		height: 1.5rem;
	}
	.share-option__icon :global(svg) {
		width: 100%;
		height: 100%;
	}
	.share-option__label {
		font-size: 0.75rem;
		font-weight: 500;
		letter-spacing: 0.01em;
	}

	.share-divider {
		height: 1px;
		margin: 1.25rem 0 1rem;
		background: #152040;
	}

	.share-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 0.5rem 0.5rem 0.75rem;
		border-radius: 0.625rem;
		border: 1px solid #1a2a4a;
		background: #0d1529;
	}
	.share-link__url {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex: 1;
		min-width: 0;
		color: #4a5568;
	}
	.share-link__text {
		flex: 1;
		min-width: 0;
		font-size: 0.78rem;
		color: #8494a7;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.share-link__btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.5rem 0.85rem;
		border-radius: 0.5rem;
		border: none;
		background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
		color: white;
		font-size: 0.78rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 200ms ease;
		box-shadow: 0 2px 12px rgba(20, 184, 166, 0.25);
	}
	.share-link__btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 16px rgba(20, 184, 166, 0.35);
	}
	.share-link__btn.copied {
		background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	}
</style>
