// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Augment the Cypress namespace to include our custom command
// cypress/support/commands.d.ts
// cypress/support/commands.d.ts
/// <reference types="cypress" />

declare global {
  interface Cypress {
    // You can extend Cypress if needed
  }

  interface Chainable {
    /**
     * Custom command to login
     * @example cy.login('email@example.com', 'password123')
     */
    login(username?: string, password?: string): Chainable<void>;
  }
}

export {}; // This file is now an ES module
