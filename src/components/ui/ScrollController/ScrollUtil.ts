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

};