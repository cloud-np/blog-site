import { transform } from "typescript";
import { ScrollUtil } from "./ScrollUtil";
import type { RefinedScrollOptions, ScrollOptions, StyleProp } from "./scroll.model";
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


function stylablePropToStyle(prop: StyleProp, value: number): [string, string] {
    switch (prop) {
        case 'y':
            return ['transform', `translateY(${value}px)`];
        case 'x':
            return ['transform', `translateX(${value}px)`];
        case 'scale':
            return ['scale', `${value}`];
        case 'opacity':
            return ['opacity', `${value}`];
        default:
            throw new Error('Unsupported property');
    }
}

function updateScrollListener(listeners: Record<string, Function>) {
    window.addEventListener('scroll', () => {
        Object.values(listeners).forEach(listener =>
            listener()
        );
    });
}

let LISTENERS: Record<string, Function> = {};

export class ScrollController {
    static threshold: number;

    static addAsEventListener(func: Function, funcId: string) {
        // Update the listeners and add the listener to the global scroll event
        if (!LISTENERS[funcId]) {
            LISTENERS[funcId] = func;
            updateScrollListener(LISTENERS);
        }
    } 


    static smooth(cls: string, options: ScrollOptions, styleOptions: Record<string, string | number | Function>){
        styleOptions = styleOptions || {};
        // (() => ScrollUtil.isElementInViewport(cls));

        const startCondition = options.startCondition || (() => true);
        const endCondition = options.endCondition || (() => false);

        const refinedOptions: RefinedScrollOptions = { 
            ...options,
            startCondition: ScrollUtil.refineConditionFunc(startCondition, styleOptions),
            endCondition: ScrollUtil.refineConditionFunc(endCondition, styleOptions),
        };

        ScrollController.addAsEventListener(
            ScrollController.applyStyleOptionsCallback(cls, options, styleOptions),
            ScrollUtil.createScrollFuncId("smooth", cls, styleOptions, options)
        );
    }

    // This function is getting called continuously on each scroll event.
    static applyStyleOptionsCallback(cls: string, options: ScrollOptions, styleOptions: Record<StyleProp, string | number | Function>) {
        return () => {
            const startCondition = ScrollUtil.refineConditionFunc(options.startCondition || (() => true), styleOptions);
            const endCondition = ScrollUtil.refineConditionFunc(options.endCondition || (() => false), styleOptions);
            if (!startCondition() || endCondition()) return;

            for(let [key, value] of Object.entries(styleOptions)) {
                if (typeof value === 'function') {
                    value = value();
                }

                const [styleKey, styleValue] = stylablePropToStyle(key as StyleProp, value as number);
                document.querySelectorAll(cls).forEach((el: HTMLElement) =>
                    el.style[styleKey] = styleValue
                );
            };
        }
    }

    // static custom(cls: string, func: Function, ...args: any[]) {
    //     const innerFunc = () => {
    //         func.bind(null, args)();
    //     }
    //     ScrollUtil.createScrollFuncId("custom", cls, {}, { start: 0, end: 0 });
    //     ScrollController.tryToAddAsEventListener(, innerFunc);
    // }

    static setThreshold(threshold: number) {
        // this.threshold = threshold;
    }
}