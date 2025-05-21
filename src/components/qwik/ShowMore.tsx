// src/components/show-more-less/show-more-less.tsx
import { $, component$, Slot, useSignal, useStyles$, useVisibleTask$ } from "@builder.io/qwik";


interface ShowMoreLessProps {
    startingHeightClass: string;      // Maximum height before content is truncated
    buttonLabels?: {        // Optional custom button labels
        more: string;
        less: string;
    };
}

export const ShowMore = component$((props: ShowMoreLessProps) => {
    // Default props
    const {
        startingHeightClass,
        buttonLabels = {more: 'Show more', less: 'Show less'},
    } = props;

    // State signals
    const contentRef = useSignal<HTMLDivElement>();
    const contentHeight = useSignal<number>(0);
    const isExpanded = useSignal<boolean>(false);
    const showToggle = useSignal<boolean>(false);

    // Toggle expanded state
    const toggleExpand$ = $(() => {
        isExpanded.value = !isExpanded.value;
    });

    // Measure content height on component mount and window resize
    useVisibleTask$(({track}) => {
        // Re-run when contentRef changes
        track(() => contentRef.value);

        if (contentRef.value) {
            // Get the actual content height
            const height = contentRef.value.scrollHeight;
            contentHeight.value = height;

            // Only show toggle if content height exceeds max height
            // showToggle.value = height > maxHeight;
        }
    });

    // overflow: hidden;
    // text-overflow: ellipsis;
    // white-space: nowrap;
    return (
        <div>
            <div class={`relative inline-flex overflow-hidden text-ellipsis ${isExpanded.value ? "max-h-full" : startingHeightClass}`}>
                <Slot />
            </div>
            <p class="underline cursor-pointer"
                onClick$={toggleExpand$}
            >
                {isExpanded.value ? buttonLabels.less : buttonLabels.more}
            </p>
        </div>
    );});