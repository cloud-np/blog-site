<script lang="ts">
    import type { Snippet } from 'svelte';
    import HeadingWithAnchor from './HeadingWithAnchor.svelte';

    interface Props {
        id?: string;
        title: string;
        children?: Snippet;
        [key: string]: any;
    }

    let { id, title, children, ...restProps }: Props = $props();
</script>

<HeadingWithAnchor as="h4" {id} {title} {children} {...restProps} />