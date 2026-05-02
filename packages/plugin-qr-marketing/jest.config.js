const { loadEnv } = require("@medusajs/framework/utils")
loadEnv("test", process.cwd())
module.exports = {
  transform: {
    "^.+\\.[jt]s?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
          target: "es2022",
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  testMatch: ["**/src/**/__tests__/**/*.unit.spec.[jt]s"],
}
