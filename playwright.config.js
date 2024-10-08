import { defineConfig, devices } from "@playwright/test";
import { devices as playwrightDevices } from "playwright";

export default defineConfig({
  timeout: 100000,
  use: {
    ...playwrightDevices["Desktop Chrome"],
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report" }], // Cambiar 'outputPath' a 'outputFolder'
  ],
});
