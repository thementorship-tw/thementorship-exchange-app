/** @type {import("lint-staged").Configuration} */
const config = {
  // eslint --fix runs first, prettier --write settles the formatting afterwards.
  // lint-staged re-stages whatever the tasks rewrite.
  // --no-warn-ignored keeps staged-but-eslint-ignored files from emitting warnings.
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["eslint --fix --no-warn-ignored", "prettier --write"],
  "*.{json,md,css,yml,yaml}": "prettier --write",
  // A function entry means the matched filenames are NOT appended: tsc needs the
  // whole project. Only fires when TypeScript files are part of the commit.
  "*.{ts,tsx}": () => "pnpm typecheck",
};

export default config;
