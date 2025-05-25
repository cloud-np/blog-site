import { $, component$, Slot, useSignal } from '@builder.io/qwik';

interface AccordionItemProps {
    title: string;
    subTitle?: string;
    isOpen?: boolean;
    onToggle?: () => void;
}

interface AccordionData {
    title: string;
    subTitle?: string;
    content: string;
}

interface AccordionProps {
    allowMultiple?: boolean;
    defaultOpenItems?: number[];
    accordionData: AccordionData[];
}

export const AccordionItem = component$<AccordionItemProps>(({title, subTitle = undefined, isOpen = false, onToggle}) => {
    const contentRef = useSignal<HTMLDivElement>();

    return (
        <div class="border border-gray-200 rounded-lg mb-2">
            <div class="flex flex-col">
                <h6 class={[
                    "w-full px-4 py-3 text-left cursor-pointer",
                    "flex items-center font-medium text-gray-400",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                ]}
                        onClick$={onToggle}
                        aria-expanded={isOpen}
                        type="button"
                >
                    <svg class={[
                        "w-4 h-4 transition-transform transform duration-200 mr-2 -rotate-90",
                        isOpen ? "rotate-0" : ""
                    ]} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                    </svg>
                    <button>{title}</button>
                </h6>
                {subTitle && <span>{subTitle}</span>}
            </div>

            <div
                ref={contentRef}
                class={[
                    "transition-all duration-300 ease-in-out overflow-hidden",
                    isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                ]}
            >
                <div class="px-4 py-3 text-gray-700 border-t border-gray-200">
                    <Slot/>
                </div>
            </div>
        </div>
    );
});

// Usage Example Component
export const Accordion = component$<AccordionProps>(({
     allowMultiple = false,
     defaultOpenItems = [],
     accordionData = [],
}) => {
    const openItems = useSignal<Set<number>>(new Set([0]));

    const toggleItem = $((index: number) => {
        const newOpenItems = new Set(openItems.value);

        if (newOpenItems.has(index)) {
            newOpenItems.delete(index);
        } else {
            if (!allowMultiple) {
                newOpenItems.clear();
            }
            // Allow multiple items open
            newOpenItems.add(index);
        }

        openItems.value = newOpenItems;
    });

    return (
        <div class="p-6 max-w-4xl mx-auto">
            <h1 class="text-3xl font-bold text-gray-900 mb-6">Qwik Accordion Example</h1>

            <div class="space-y-2">
                {accordionData.map((item, index) => (
                    <AccordionItem
                        key={index}
                        title={item.title}
                        isOpen={openItems.value.has(index)}
                        onToggle={$(() => toggleItem(index))}
                    >
                        <p>{item.content}</p>
                    </AccordionItem>
                ))}
            </div>
        </div>
    );
});