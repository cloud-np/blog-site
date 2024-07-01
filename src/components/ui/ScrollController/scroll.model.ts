export type StyleProp = 'y' | 'x' | 'scale' | 'opacity';

export const STYLE_PROPS = ['y', 'x', 'scale', 'opacity'];

export type UniqProp = 'direction';

export const UNIQ_PROPS = ['direction'];

export type Condition = (...args: any[]) => boolean;

export interface ScrollOptions {
    start?: string | number;
    end?: string | number;
    startCondition?: Condition;
    endCondition?: Condition;
    // startValue?: number;
    // endValue?: number;
}

export interface RefinedScrollOptions {
    start: string | number;
    end: string | number;
    startCondition: Condition;
    endCondition: Condition;
    startValue?: number;
    endValue?: number;
}