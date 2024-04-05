import { transform } from "typescript";
import { ScrollUtil } from "./ScrollUtil";
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

type StylableProp = 'y' | 'x' | 'scale';

function stylablePropToStyle(prop: StylableProp, value: number): [string, string] {
    switch (prop) {
        case 'y':
            return ['transform', `translateY(${value}px)`];
        case 'x':
            return ['transform', `translateX(${value}px)`];
        case 'scale':
            return ['transform', `scale(${value})`];
        default:
            throw new Error('Unsupported property');
    }
}

function updateScrollListener(listeners: Record<string, Function>) {
    window.addEventListener('scroll', () => {
        Object.values(listeners).forEach((listener) => {
            listener();
        });
    });
}

let LISTENERS: Record<string, Function> = {};

export class ScrollController {
    static threshold: number;

    static tryToAddAsEventListener(funcName: string, func: Function, ...args: any[]) {
        const funcId = `${funcName}-${args.toString()}`;
        // Update the listeners and add the listener to the global scroll event
        if (!LISTENERS[funcId]) {
            LISTENERS[funcId] = func;
            updateScrollListener(LISTENERS);
        }
    } 

    static smooth(cls: string, styleOptions: Record<string, string | number | Function>){
        styleOptions = styleOptions || {};
        const innerFunc = () => {
            ScrollController.appendStyleOptions(cls, styleOptions);
        }
        ScrollController.tryToAddAsEventListener("smooth", innerFunc, cls, styleOptions.toString());
    }

    static appendStyleOptions(cls: string, styleOptions: Record<StylableProp, string | number | Function>) {
        Object.entries(styleOptions).forEach(([key, value]) => {
            if (typeof value === 'function') {
                value = value();
            }
            const [styleKey, styleValue] = stylablePropToStyle(key as StylableProp, value as number);
            document.querySelectorAll(cls).forEach((el: HTMLElement) =>
                el.style[styleKey] = styleValue
            );
        });
    }

    static custom(cls: string, func: Function, ...args: any[]) {
        const innerFunc = () => {
            func.bind(null, args)();
        }
        ScrollController.tryToAddAsEventListener("custom", innerFunc, cls, ...args);
    }

    static setThreshold(threshold: number) {
        // this.threshold = threshold;
    }
}