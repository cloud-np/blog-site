import { html, css, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { lightThemeIcon, darkThemeIcon } from './icons';
import { ThemeType, ThemeUtil } from './theme';

const THEME_KEY = "theme";

@customElement('theme-toggle-button')
export class ThemeToggleButton extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
    button {
      width: 28px;
      height: 28px;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-sizing: border-box;
      border: none;
      outline: none;
      background-color: var(--theme-surface-1);
      fill: currentcolor;
      color: var(--theme-on-surface-1);
      text-decoration: none;
      cursor: pointer;
      vertical-align: middle;
      -webkit-tap-highlight-color: transparent;
      border-radius: 50%;
      border: 1px solid var(--theme-primary);
      transition: background-color 100ms cubic-bezier(0.6, -0.28, 0.735, 0.045);
    }
  `;

  // set the _doc element
  private _doc = document.firstElementChild;

  @property({ type: String })
  theme: ThemeType | null = null;

  private _getCurrentTheme() {
    // check for a local storage theme first
    const localStorageTheme = localStorage.getItem(THEME_KEY);
    if (localStorageTheme !== null) {
      this._setTheme(localStorageTheme);
    } else {
      this._setTheme(ThemeType.light);
    }
  }

  firstUpdated() {
    this._getCurrentTheme();
  }

  private _setTheme(theme) {
    this.theme = theme;
    this._doc.setAttribute('color-scheme', theme);
    // (document.getElementById('theme-stylesheet') as HTMLAnchorElement).href = "/src/styles/" + theme + '.theme.scss';

    localStorage.setItem(THEME_KEY, theme);
  }

  private _toggleTheme() {
      this._setTheme(ThemeUtil.getOppositeTheme(this.theme))
  }

  render() {
    return html`
      <button
        @click=${this._toggleTheme}
        title=${`Enable ${ThemeUtil.getOppositeTheme(this.theme)} Theme`}
      >
        ${this.theme === ThemeType.dark 
          ? html`
              ${lightThemeIcon}
            `
          : html`
              ${darkThemeIcon}
            `}
      </button>
    `;
  }
}
