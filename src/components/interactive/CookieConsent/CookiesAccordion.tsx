import { $, component$, useSignal } from "@builder.io/qwik";
import { AccordionItem } from "@components/common/Accordion.tsx";
import { COOKIES_CATEGORIES, type Cookie } from "@data/cookies.const.ts";

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
        <div class="p-2 pt-4 max-w-4xl mx-auto">
            <div class="space-y-2 text-base">
                {COOKIES_CATEGORIES.map((item, index) => (
                    <AccordionItem
                        key={item.type}
                        title={item.type}
                        subTitle={item.description}
                        isOpen={openItems.value.has(index)}
                        onToggle={$(() => toggleItem(index))}
                    >
                        <div>
                            {item.cookies.map(cookie => (
                                <CookieInfo key={cookie.name} cookie={cookie} />
                            ))}
                        </div>
                    </AccordionItem>
                ))}
            </div>
        </div>
    );
});

const CookieInfo = component$<Cookie>((cookie) => {
    return (
        <div>
            iwhrgfohwiofrh
            hiuwheifuh
                <br/>
            <br/>
            <br/>
                wuefhuehf
            </div>
            );
});