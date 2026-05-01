const { loadEnv } = require("@medusajs/framework/utils")
loadEnv("test", process.cwd())
module.exports = {
  transform: { "^.+\\.[jt]s?$": ["@swc/jest"] },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
}
