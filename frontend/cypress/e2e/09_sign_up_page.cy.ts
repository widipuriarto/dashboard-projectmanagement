describe('Sign Up Page UI & Transition Tests', () => {
  beforeEach(() => {
    cy.visit('/sign-up');
  });

  it('renders sign up elements according to specification', () => {
    // Verify Telkom logo and headers
    cy.get('img[alt="Telkom Indonesia"]').should('be.visible');
    cy.contains('h1', 'Create Account').should('be.visible');
    cy.contains('p', 'Sign up to get started with your dashboard').should('be.visible');

    // Verify all 4 input fields and labels
    cy.contains('label', 'Full Name').should('be.visible');
    cy.get('[data-testid="input-signup-fullname"]').should('be.visible');

    cy.contains('label', 'Email Address').should('be.visible');
    cy.get('[data-testid="input-signup-email"]').should('be.visible');

    cy.contains('label', 'Password').should('be.visible');
    cy.get('[data-testid="input-signup-password"]').should('be.visible');

    cy.contains('label', 'Confirm Password').should('be.visible');
    cy.get('[data-testid="input-signup-confirm-password"]').should('be.visible');

    // Verify footer link
    cy.contains('Already have an account?').should('be.visible');
    cy.contains('a', 'Sign in').should('have.attr', 'href', '/sign-in');

    // Verify sign up button
    cy.get('[data-testid="button-signup-submit"]').should('be.visible').and('contain.text', 'Sign Up');
  });

  it('submits form and transitions to dashboard route', () => {
    cy.get('[data-testid="input-signup-fullname"]').type('Arif PM');
    cy.get('[data-testid="input-signup-email"]').type('arif.pm@telkom.co.id');
    cy.get('[data-testid="input-signup-password"]').type('TelkomSecret123!');
    cy.get('[data-testid="input-signup-confirm-password"]').type('TelkomSecret123!');

    cy.get('[data-testid="button-signup-submit"]').click();

    // Verify URL transitions to dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

