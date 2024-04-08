import type { Condition, ScrollOptions, StyleProp } from "./scroll.model";

export namespace ScrollUtil {
    export const convertToNumber = (value: string | number): number => {
        if (typeof value === 'number') {
            return value;
        }

        // Extract the number and unit from the value
        const matches = value.match(/^([0-9.]+)(vh|vw)$/);
        if (!matches) {
            throw new Error('Invalid input format. Expected format: "<number>vh" or "<number>%"');
        }

        const [, numberPart, unit] = matches;
        const number = parseFloat(numberPart);

        switch (unit) {
            case 'vw':
                return window.innerWidth * (number / 100);
            case 'vh':
                return window.innerHeight * (number / 100);
            default:
                throw new Error('Unsupported unit. Only "vh" and "%" are supported.');
        }
    };

    export const isElementInViewport = (cls: string) => {
        const elements = document.getElementsByClassName(cls);
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        for (let element of elements) {
            const rect = element.getBoundingClientRect();
            if (rect.top >= 0 && rect.left >= 0 && rect.bottom <= viewportHeight && rect.right <= (window.innerWidth || document.documentElement.clientWidth)) {
                return true;
            }
        }
        return false;
    }

    export const refineCodition = (conditionFunc: Condition, styleOptions: Record<string, string | number | Function>, element: HTMLElement) => {
        const conditionFuncParams = getParameters(conditionFunc).map(param => {
            let value = styleOptions[param];
            if (typeof value === 'function') {
                value = refineValueStyleFunction(value, element);
            }
            // We check like this because what if the value is just falsy like 0
            if (value === undefined) throw new Error(`Missing parameter value for ${param}`);
            return value;
        });
        return () => conditionFunc(...conditionFuncParams);
    }

    export const refineValueStyleFunction = (valueFunc: Function, element: HTMLElement, previousStylesValue?: Record<string, string | number>): string | number => {
        const conditionFuncParams = getParameters(valueFunc).map((param: StyleProp) => {
            const [styleKey, _] = stylablePropToStyle(param);
            previousStylesValue ||= {};
            // if (!element.style[styleKey]) throw new Error(`Missing parameter key for ${param} -> ${styleKey}`);
            return previousStylesValue[styleKey] || 0;
            // return previousStylesValue[styleKey] || element.style[styleKey] || 0;
        });
        return valueFunc(...conditionFuncParams);
    }

    const isValueNil = (value: string | number | null | undefined): boolean => {
        return value === null || value === undefined;
    }

    const getParameters = (func: Function) => {
		// Convert function to string
		const funcStr = func.toString();
		// Extract parameter names using regex
		const result = funcStr
			.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')'))
			.match(/([^\s,]+)/g);
		return result === null ? [] : result;
	}

    export const createScrollFuncId = (funcName: string, cls: string, styleOptions: Record<StyleProp, string | number | Function>, options?: ScrollOptions) => {
        return `${funcName}-${cls}-${styleOptions.toString()}-${(options || {}).toString()}`;
    }

    export const stylablePropToStyle = (prop: StyleProp, value?: number): [string, string] => {
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

};