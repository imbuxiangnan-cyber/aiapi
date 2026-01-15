import config from "@echristian/eslint-config";

export default config({
  prettier: {
    plugins: ["prettier-plugin-packagejson"],
  },
  rules: {
    // Disable rules that may break functionality
    "require-atomic-updates": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "max-lines-per-function": "off",
  },
});
