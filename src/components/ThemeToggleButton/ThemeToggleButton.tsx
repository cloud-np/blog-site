import { component$, useSignal, useStylesScoped$, type Signal } from "@builder.io/qwik";
import styles from './ThemeToggleButton.css?inline';
import { ThemeType, ThemeUtil } from "./theme";
import { lightThemeIcon, darkThemeIcon } from './icons';

const THEME_KEY = "theme";

const setTheme = (theme: Signal<ThemeType>) => {
    document.firstElementChild?.setAttribute('color-scheme', theme.value);
    theme.value = ThemeUtil.getOppositeTheme(theme.value);
    localStorage.setItem(THEME_KEY, theme.value);
}

export const ThemeToggleButton = component$(() => {
    useStylesScoped$(styles);
    const theme = useSignal(ThemeType.dark);

    return <button
        onClick$={() => setTheme(theme)}
        title={`Enable ${ThemeUtil.getOppositeTheme(theme.value)} Theme`}
    >
        {theme.value === ThemeType.dark
          ? lightThemeIcon
          : darkThemeIcon}
    </button>
});