/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts", "**/?(*.)+(test).ts"],
  testPathIgnorePatterns: ["/node_modules/", "/.medusa/", "/dist/"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
          target: "es2019",
          transform: { decoratorMetadata: true, legacyDecorator: true },
        },
      },
    ],
  },
}
