import { defineConfig } from "tsup";

export default defineConfig({
  target: "node16",
  format: ["cjs", "esm"],
  clean: true,
  dts: true,
  entry: ["src/**/*.ts"],
});
