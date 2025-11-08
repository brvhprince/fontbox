module.exports = {
  extends: ["next", "next/core-web-vitals"],
  root: true,
  parserOptions: {
    project: true
  },
  rules: {
    "@next/next/no-img-element": "off"
  }
};
