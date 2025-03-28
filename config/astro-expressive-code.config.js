// Load your saved theme JSONC file here and create a theme from it
import fs from "node:fs";
import { ExpressiveCodeTheme } from "astro-expressive-code";

const jsoncString = fs.readFileSync(new URL(`../dark-theme.jsonc`, import.meta.url), 'utf-8');
const monokaiPro = ExpressiveCodeTheme.fromJSONString(jsoncString);

export function getExpressiveCodeConfig() {
    return {
        themeCssSelector: theme => `[color-scheme='${theme.type}']`,
        // themes: ['material-theme-darker', 'material-theme-lighter'],
        // themes: [monokaiPro, 'solarized-light'],
        themes: [monokaiPro, 'vitesse-light']
    }
}
