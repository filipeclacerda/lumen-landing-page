export default [
  {
    files: ["script.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        document: "readonly",
        HTMLElement: "readonly",
        IntersectionObserver: "readonly",
        ResizeObserver: "readonly",
        localStorage: "readonly",
        matchMedia: "readonly",
        window: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "error",
      "no-undef": "error",
    },
  },
];
