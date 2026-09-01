/**
 * Single responsibility: centralize every static image `require()` in the
 * app, the same way strings.ts centralizes UI text. Metro needs a static
 * string literal inside `require()`, so unlike strings this can't be plain
 * data - but every screen that needs an image imports it from here instead
 * of writing its own `require("../../assets/images/...")`, so swapping an
 * asset later means changing one path in one file.
 */
export const images = {
  logo: require("../../assets/new-logo-for-login.png"),
  woodBackgroundLight: require("../../assets/images/wood-bg-light.jpg"),
  woodBackgroundDark: require("../../assets/images/wood-bg-dark.jpg"),
} as const;
