describe("Skenario 7: Navigation Guard & Unsaved Changes Protection", () => {
  beforeEach(() => {
    // Kunjungi halaman master repository dan pastikan tabel termuat
    cy.visit("/repository");
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.get('[data-testid="table-row"]').should("have.length.gt", 0);
  });

  it("Test 7.1: modal peringatan unsaved changes wajib muncul saat navigasi mundur pada form yang dirty", () => {
    // 1. Masuk ke formulir tambah proyek
    cy.get('[data-testid="btn-add-project"]').click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Ketik teks pada salah satu input agar form berstatus dirty
    cy.get('[data-testid="input-nama-proyek"]').type("Draft Project Unsaved E2E");

    // 3. Klik tombol 'Back' di toolbar
    cy.get('[data-testid="btn-back"]').click();

    // 4. Verifikasi modal peringatan perubahan belum disimpan muncul di tengah layar
    cy.get('[data-testid="unsaved-changes-modal"]')
      .should("be.visible")
      .and("contain.text", "Discard Unsaved Changes?");

    // 5. Verifikasi tombol Cancel dan Discard tersedia pada modal
    cy.get('[data-testid="unsaved-modal-cancel"]').should("be.visible");
    cy.get('[data-testid="unsaved-modal-discard"]').should("be.visible");
  });

  it("Test 7.2: harus membatalkan discard dan mempertahankan draft teks input saat tombol 'Cancel' diklik", () => {
    const draftText = "Draft Project Unsaved E2E";

    // 1. Masuk ke formulir tambah proyek
    cy.get('[data-testid="btn-add-project"]').click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Isi teks pada nama proyek
    cy.get('[data-testid="input-nama-proyek"]').type(draftText);

    // 3. Picu modal navigasi mundur
    cy.get('[data-testid="btn-back"]').click();
    cy.get('[data-testid="unsaved-changes-modal"]').should("be.visible");

    // 4. Batalkan discard dengan tombol 'Cancel'
    cy.get('[data-testid="unsaved-modal-cancel"]').click();

    // 5. Verifikasi modal tertutup, pengguna tetap di formulir, dan draf teks tidak hilang
    cy.get('[data-testid="unsaved-changes-modal"]').should("not.exist");
    cy.get('[data-testid="project-form"]').should("be.visible");
    cy.get('[data-testid="input-nama-proyek"]').should("have.value", draftText);
  });

  it("Test 7.3: harus membatalkan perubahan dan kembali ke tabel saat tombol 'Discard' dikonfirmasi", () => {
    // 1. Masuk ke formulir tambah proyek
    cy.get('[data-testid="btn-add-project"]').click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Isi field agar dirty
    cy.get('[data-testid="input-nama-proyek"]').type("Discarded Project Draft");

    // 3. Klik tombol Cancel di bagian footer formulir
    cy.get('[data-testid="btn-cancel-project"]').click();

    // 4. Modal unsaved changes muncul
    cy.get('[data-testid="unsaved-changes-modal"]').should("be.visible");

    // 5. Konfirmasi pembatalan dengan menekan 'Discard'
    cy.get('[data-testid="unsaved-modal-discard"]').click();

    // 6. Verifikasi modal dan formulir tertutup, kembali ke tabel master repository
    cy.get('[data-testid="unsaved-changes-modal"]').should("not.exist");
    cy.get('[data-testid="project-form"]').should("not.exist");
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.url().should("not.include", "action=create");
  });

  it("Test 7.4: harus langsung kembali ke tabel tanpa modal saat formulir masih bersih (pristine)", () => {
    // 1. Masuk ke formulir tambah proyek tanpa mengubah apapun
    cy.get('[data-testid="btn-add-project"]').click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Klik tombol 'Back' langsung pada kondisi pristine
    cy.get('[data-testid="btn-back"]').click();

    // 3. Verifikasi modal TIDAK muncul dan langsung kembali ke tabel
    cy.get('[data-testid="unsaved-changes-modal"]').should("not.exist");
    cy.get('[data-testid="project-form"]').should("not.exist");
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
  });
});

