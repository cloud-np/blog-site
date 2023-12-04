export enum ThemeType {
    Dark = "Dark",
    Light = "Light"
};

export namespace ThemeUtil {

    export const getOppositeTheme = (themeType: ThemeType) => (
        themeType === ThemeType.Dark
        ? ThemeType.Light
        : ThemeType.Dark
    );
}