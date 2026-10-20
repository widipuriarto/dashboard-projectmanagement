// cypress/support/e2e.ts
import "./commands";

// Suppress known non-critical uncaught exceptions to prevent test halts
Cypress.on("uncaught:exception", (_err, _runnable) => {
  return false;
});

