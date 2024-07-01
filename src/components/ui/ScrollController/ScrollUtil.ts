import { UNIQ_PROPS, type Condition, type ScrollOptions, type StyleProp, type UniqProp, STYLE_PROPS } from "./scroll.model";

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

    // export const applyParamsAndGetValue = (valueFunc: Function,
    //     previousStylesValue: Record<StyleProp, string | number>,
    //     uniqProps?: Record<UniqProp, number>): [StyleProp | undefined, string | number] => {

    //     let stylePropFound: string | undefined = undefined;
    //     const conditionFuncParams = getParameters(valueFunc).map((param: StyleProp | UniqProp) => {
    //         const uniqProp = uniqProps && uniqProps[param];
    //         if (uniqProp) {
    //             return uniqProp;
    //         }
    //         if (stylePropFound) {
    //             throw new Error('ONLY one style prop per value style function');
    //         }
    //         stylePropFound = param;

    //         // console.log(param, previousStylesValue[param]);
    //         // if (!element.style[styleKey]) throw new Error(`Missing parameter key for ${param} -> ${styleKey}`);
    //         return previousStylesValue[param] || 0;
    //         // return previousStylesValue[styleKey] || element.style[styleKey] || 0;
    //     });
    //     const fvalue: number = valueFunc(...conditionFuncParams);
    //     // NOTE: He may not use any STYLE PROPS
    //     if (stylePropFound) {
    //         previousStylesValue[stylePropFound as string] = fvalue;
    //     }
    //     return [stylePropFound, fvalue];
    // }

    export const getParameters = (func: Function): RegExpMatchArray | [] => {
		// Convert function to string
		const funcStr = func.toString();
		// Extract parameter names using regex
		const result = funcStr
			.slice(funcStr.indexOf('(') + 1, funcStr.indexOf(')'))
			.match(/([^\s,]+)/g);
		return result === null ? [] : result;
	}

    export const createScrollFuncId = (funcName: string, cls: string, styleOptions: Record<StyleProp, string | number | Function>, options?: ScrollOptions) => {
        return `${funcName}-${cls}-${objToString(styleOptions)}-${objToString(options|| {})}`;
    }

    const objToString = (obj: Object) => {
        return Object.entries(obj).map((key, val) => `${key}${val}`).toString();
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
                throw new Error('Unsupported style property', prop);
        }
    }

    export const isUniqProp = (param: any): param is UniqProp => {
        return UNIQ_PROPS.includes(param);
    }

    export const isStyleProp = (param: any): param is UniqProp => {
        return STYLE_PROPS.includes(param);
    }

};