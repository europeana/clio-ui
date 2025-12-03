import { defineConfig } from "cypress";

export default defineConfig({

  env: {
    dataServer: 'http://127.0.0.1:3000',
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: 'http://localhost:4280',
  },
});
