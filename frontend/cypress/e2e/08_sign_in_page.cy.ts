describe('Sign In Page UI & Transition Tests', () => {
  beforeEach(() => {
    cy.visit('/sign-in');
  });

  it('renders sign in elements according to specification', () => {
    // Verify Telkom logo and headers
    cy.get('img[alt="Telkom Indonesia"]').should('be.visible');
    cy.contains('h1', 'Welcome home').should('be.visible');
    cy.contains('p', 'Please enter your details.').should('be.visible');

    // Verify field labels and input fields
    cy.contains('label', 'Email Address').should('be.visible');
    cy.get('[data-testid="input-signin-email"]').should('be.visible');
    cy.contains('label', 'Password').should('be.visible');
    cy.get('[data-testid="input-signin-password"]').should('be.visible');

    // Verify remember me, forgot password and sign up links
    cy.contains('label', 'Remember me').should('be.visible');
    cy.get('[data-testid="checkbox-signin-remember"]').should('exist');
    cy.contains('a', 'Forgot password?').should('be.visible');
    cy.contains("Don't have an account?").should('be.visible');
    cy.contains('a', 'Sign up').should('have.attr', 'href', '/sign-up');

    // Verify sign in button
    cy.get('[data-testid="button-signin-submit"]').should('be.visible').and('contain.text', 'Sign In');
  });

  it('toggles password visibility correctly', () => {
    const passwordInput = cy.get('[data-testid="input-signin-password"]');
    passwordInput.should('have.attr', 'type', 'password');
    passwordInput.type('TelkomSecret123!');

    // Toggle to visible text
    cy.get('button[aria-label="Show password"]').click();
    cy.get('[data-testid="input-signin-password"]').should('have.attr', 'type', 'text');

    // Toggle back to password
    cy.get('button[aria-label="Hide password"]').click();
    cy.get('[data-testid="input-signin-password"]').should('have.attr', 'type', 'password');
  });

  it('submits form and transitions to dashboard route', () => {
    cy.get('[data-testid="input-signin-email"]').type('pm.rso@telkom.co.id');
    cy.get('[data-testid="input-signin-password"]').type('password123');

    cy.get('[data-testid="button-signin-submit"]').click();

    // Verify URL transitions to dashboard
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

