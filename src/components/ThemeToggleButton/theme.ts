export enum ThemeType {
    dark = "dark",
    light = "light"
};

export namespace ThemeUtil {
    export const getOppositeTheme = (themeType: ThemeType) => (
        themeType === ThemeType.dark
        ? ThemeType.light
        : ThemeType.dark
    );
}