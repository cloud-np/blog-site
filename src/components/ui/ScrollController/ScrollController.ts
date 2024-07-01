import { ScrollUtil } from "./ScrollUtil";
import type { Condition, ScrollOptions, StyleProp, UniqProp } from "./scroll.model";
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
    let lastPosition: number = 0;
    let direction = 0;

    export const addAsEventListener = () => {
        const listeners = Object.values(scrollableElements).reduce((acc, el) => {
            console.log("ee: ", el.funcId);
            acc[el.funcId] = el.scrollFunc.bind(el);
            return acc;
        }, {});
        updateScrollListener(listeners);
    } 

    const updateScrollListener = (listeners: Record<string, Function>) => {
        window.addEventListener('scroll', () => {
            updateScrollDirection();
            Object.values(listeners).forEach(listener =>
                listener()
            );
        });
    }

    export const el = (cls: string, styleOptions: Record<string, string | number | Function>, options?: ScrollOptions) => {
        const scrollEl = new ScrollableElement(cls, styleOptions, options);
        scrollableElements[scrollEl.funcId] = scrollEl;
        addAsEventListener();
    }

    export const custom = (cls: string, func: Function) => {
        const funcId = func.toString();
    }

    const updateScrollDirection = (): void => {
        // Get the current scroll position
        const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
        
        // Determine the scroll direction
        if (currentScrollPosition > lastPosition) {
            direction = 1;
        } else if (currentScrollPosition < lastPosition) {
            direction = -1;
        } else {
            direction = 0;
        }
        // Update the last scroll position
        lastPosition = currentScrollPosition;
    }

    export const getDirection = (): number => {
        return direction;
    }

    export const uniqPropsMap: Record<UniqProp, () => number> = {
        direction: getDirection
    };

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
    funcId: string;
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

        this.funcId = ScrollUtil.createScrollFuncId("smooth", this.cls, this.styleOptions, this.options);
    }

    // This function is getting called continuously on each scroll event.
    scrollFunc() {
        this.elements.forEach((el: HTMLElement) => {
            if (this.options) {
                const startCondition = this.refineCodition(this.options.startCondition || (() => true));
                const endCondition = this.refineCodition(this.options.endCondition || (() => false));
                if (!startCondition() || endCondition()) return;
            }

            for(let [key, value] of Object.entries(this.styleOptions)) {
                if (typeof value === 'function') {
                    value = this.applyParamsAndGetValue(value);
                }
                const [styleKey, styleValue] = ScrollUtil.stylablePropToStyle(key as StyleProp, value as number);

                el.style[styleKey] = styleValue;
            };
        });
    }

    applyParamsAndGetValue (valueFunc: Function): number {
        let styleKey = undefined;
        const conditionFuncParams = ScrollUtil.getParameters(valueFunc).map((param: StyleProp | UniqProp) => {
            if (ScrollUtil.isUniqProp(param)) {
                return Scroll.uniqPropsMap[param]();
            }

            if (ScrollUtil.isStyleProp(param)) {
                styleKey = param;
                return this.previousStylesValue[param] || 0;
            }

            throw new Error(`Param: ${param} can be either UniqProp or StyleProp`);
        });
        const fvalue: number = valueFunc(...conditionFuncParams);
        // NOTE: He may not use any STYLE PROPS
        if (styleKey) {
            this.previousStylesValue[styleKey] = fvalue;
        }
        return fvalue;
    }

    refineCodition(conditionFunc: Condition) {
        const conditionFuncParams = ScrollUtil.getParameters(conditionFunc).map((param: StyleProp | UniqProp) => {
            let value = this.styleOptions[param];
            if (typeof value === 'function') {
                value = this.applyParamsAndGetValue(value);
            }
            // We check like this because what if the value is just falsy like 0
            if (value === undefined) throw new Error(`Missing parameter value for ${param}`);
            return value;
        });
        return () => conditionFunc(...conditionFuncParams);
    }

} 