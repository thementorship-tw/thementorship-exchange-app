const config = {
  "*.{ts,tsx,js,jsx,mjs,cjs}": [
    "eslint --fix --no-warn-ignored",
    "prettier --write",
  ],
  "*.{json,md,css,yml,yaml}": "prettier --write",
  "*.{ts,tsx}": () => "pnpm typecheck",
};

export default config;
