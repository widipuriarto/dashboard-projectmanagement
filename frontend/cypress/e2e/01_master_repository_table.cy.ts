describe("Skenario 1: Master Repository Table & Virtual Scrolling", () => {
  beforeEach(() => {
    // Visit the master repository page before each test execution
    cy.visit("/repository");
  });

  it("Test 1.1: harus me-render halaman master repository, toolbar utama, dan baris tabel", () => {
    // Toolbar elements must be visible and accessible
    cy.get('[data-testid="search-input"]').should("be.visible");
    cy.get('[data-testid="search-column-dropdown"]').should("be.visible");
    cy.get('[data-testid="filter-button"]:visible').should("be.visible");
    cy.get('[data-testid="columns-button"]:visible').should("be.visible");
    cy.get('[data-testid="btn-add-project"]').should("be.visible");

    // Table container and at least one row must be rendered
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);

    // Each row must contain action buttons (Edit & Delete)
    cy.get('[data-testid="table-row"]')
      .first()
      .within(() => {
        cy.get('[data-testid="row-actions-edit"]').should("be.visible");
        cy.get('[data-testid="row-actions-delete"]').should("be.visible");
      });
  });

  it("Test 1.2: harus mempertahankan sticky columns saat tabel di-scroll horizontal ke kanan", () => {
    const scrollContainer = '[data-testid="table-scroll-container"]';

    // Verify initial presence of sticky columns
    cy.get(scrollContainer).should("be.visible");
    cy.contains("th", "Aksi").should("be.visible");
    cy.contains("th", "No.").should("be.visible");
    cy.contains("th", /id project pm/i).should("be.visible");

    // Scroll horizontally to the right (beyond 1000px)
    cy.get(scrollContainer).scrollTo("right", { duration: 500 });

    // The mandatory sticky header columns must remain visible in viewport
    cy.contains("th", "Aksi").should("be.visible");
    cy.contains("th", "No.").should("be.visible");
    cy.contains("th", /id project pm/i).should("be.visible");

    // Action buttons on the first row must still be visible and interactable
    cy.get('[data-testid="table-row"]')
      .first()
      .within(() => {
        cy.get('[data-testid="row-actions-edit"]').should("be.visible");
        cy.get('[data-testid="row-actions-delete"]').should("be.visible");
      });

    // Reset scroll back to left
    cy.get(scrollContainer).scrollTo("left");
  });

  it("Test 1.3: harus menjalankan virtual scrolling secara lancar saat scroll vertikal", () => {
    const scrollContainer = '[data-testid="table-scroll-container"]';

    // Capture initial index of first rendered row
    cy.get('[data-testid="table-row"]')
      .first()
      .invoke("attr", "data-index")
      .should("eq", "0");

    // Scroll vertically downwards
    cy.get(scrollContainer).scrollTo("bottom", { duration: 800 });

    // Virtualizer should have dynamically loaded lower rows
    cy.get('[data-testid="table-row"]')
      .last()
      .invoke("attr", "data-index")
      .then((lastIndex) => {
        expect(Number(lastIndex)).to.be.greaterThan(0);
      });

    // Scroll back to top smoothly
    cy.get(scrollContainer).scrollTo("top", { duration: 500 });

    // Top rows should be safely restored
    cy.get('[data-testid="table-row"]')
      .first()
      .invoke("attr", "data-index")
      .should("eq", "0");
  });
});

