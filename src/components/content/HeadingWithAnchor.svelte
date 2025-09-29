<script lang="ts">
    import type { Snippet } from 'svelte';

    interface Props {
        id?: string;
        title: string;
        as?: string;
        children?: Snippet;
        [key: string]: any;
    }

    let { id, title, as = 'h2', children, ...restProps }: Props = $props();

    const slugify = (text: string): string => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')     // Replace spaces with -
            .replace(/&/g, '-and-')   // Replace & with 'and'
            .replace(/[^\w\-]+/g, '') // Remove all non-word characters
            .replace(/\-\-+/g, '-')   // Replace multiple - with single -
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
    };

    const computedId = $derived(id || slugify(title) || '');
</script>

<svelte:element
    this={as}
    id={computedId}
    class="group relative"
    {...restProps}
>
    <a
        href="#{computedId}"
        class="
            absolute
            right-full
            p-[5px_10px_5px_5px]
            invisible
            group-hover:visible
            flex
            flex-col
            justify-center
            opacity-0
            group-hover:opacity-100
            transition-opacity
        "
        aria-hidden="true"
        tabindex="-1"
    >#</a>
    {title}{@render children?.()}
</svelte:element>