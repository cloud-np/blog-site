import { transform } from "typescript";
import { ScrollUtil } from "./ScrollUtil";
import type { Condition, RefinedScrollOptions, ScrollOptions, StyleProp } from "./scroll.model";
// function throttle(callback: Function, limit: number) {
//     let wait = false;
//     return function () {
//         if (!wait) {
//             callback.call();
//             wait = true;
//             setTimeout(() => {
//                 wait = false;
//             }, limit);
//         }
//     }
// }


export namespace Scroll {
    let scrollableElements: Record<string, ScrollableElement> = {};

    export const addAsEventListener = (scrEl: ScrollableElement) => {
        const listeners = Object.values(scrollableElements).reduce((acc, el) => {
            acc[el.scrollableElementFuncId] = el.scrollFunc.bind(el);
            return acc;
        }, {});
        updateScrollListener(listeners);
    } 

    const updateScrollListener = (listeners: Record<string, Function>) => {
        window.addEventListener('scroll', () => {
            Object.values(listeners).forEach(listener =>
                listener()
            );
        });
    }

    export const el = (cls: string, styleOptions: Record<string, string | number | Function>, options?: ScrollOptions) => {
        const scrollEl = new ScrollableElement(cls, styleOptions, options);
        scrollableElements[scrollEl.scrollableElementFuncId] = scrollEl;
        addAsEventListener(scrollEl);
    }

    // static custom(cls: string, func: Function, ...args: any[]) {
    //     const innerFunc = () => {
    //         func.bind(null, args)();
    //     }
    //     ScrollUtil.createScrollFuncId("custom", cls, {}, { start: 0, end: 0 });
    //     ScrollController.tryToAddAsEventListener(, innerFunc);
    // }
}

export class ScrollableElement {
    elements: NodeListOf<Element>;
    scrollableElementFuncId: string;
    previousStylesValue: Record<string, string | number> = {};

    constructor(
        public cls: string,
        public styleOptions: Record<string, string | number | Function>,
        public options?: ScrollOptions,
    ) { 
        this.cls = cls;
        this.elements = document.querySelectorAll(cls);
        this.styleOptions = styleOptions;
        this.options = options;

        this.scrollableElementFuncId = ScrollUtil.createScrollFuncId("smooth", this.cls, this.styleOptions, this.options);
    }

    // This function is getting called continuously on each scroll event.
    scrollFunc() {
        this.elements.forEach((el: HTMLElement) => {
            if (this.options) {
                const startCondition = ScrollUtil.refineCodition(this.options.startCondition || (() => true), this.styleOptions, el);
                const endCondition = ScrollUtil.refineCodition(this.options.endCondition || (() => false), this.styleOptions, el);
                if (!startCondition() || endCondition()) return;
            }

            for(let [key, value] of Object.entries(this.styleOptions)) {
                const [styleKey, ] = ScrollUtil.stylablePropToStyle(key as StyleProp);
                if (typeof value === 'function') {
                    value = ScrollUtil.refineValueStyleFunction(value, el, this.previousStylesValue);
                    this.previousStylesValue[styleKey] = value;
                }
                const [, styleValue] = ScrollUtil.stylablePropToStyle(key as StyleProp, value as number);

                el.style[styleKey] = styleValue;
            };
        });
    }
} 