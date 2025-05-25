import { $, component$, useSignal } from "@builder.io/qwik";
import { AccordionItem } from "@components/common/Accordion.tsx";
import { COOKIES_CATEGORIES } from "@data/cookies.const.ts";

const allowMultiple = false;

export const CookiesAccordion = component$(() => {
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
                {COOKIES_CATEGORIES.map((item, index) => (
                    <AccordionItem
                        key={index}
                        title={item.type}
                        subTitle={item.description}
                        isOpen={openItems.value.has(index)}
                        onToggle={$(() => toggleItem(index))}
                    >
                        {/*<p>{item.content}</p>*/}
                        iuwhefiuwhefi
                    </AccordionItem>
                ))}
            </div>
        </div>
    );
});
