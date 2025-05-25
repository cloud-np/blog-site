import { $, component$, useSignal } from "@builder.io/qwik";
import { AccordionItem } from "@components/common/Accordion.tsx";

export const CookieAccordion = component$<any>(({allowMultiple = false, defaultOpenItems = [], accordionData = []}) => {
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
