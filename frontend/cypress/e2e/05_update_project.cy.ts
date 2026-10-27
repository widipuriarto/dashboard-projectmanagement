describe("Skenario 5: Ubah Proyek (CRUD: Update)", () => {
  beforeEach(() => {
    // Kunjungi halaman master repository dan pastikan data tabel telah termuat
    cy.visit("/repository");
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.get('[data-testid="table-row"]').should("have.length.gt", 0);
  });

  it("Test 5.1: harus memuat dan melakukan pre-populate data proyek saat tombol edit diklik", () => {
    // 1. Klik tombol aksi 'Edit' pada baris pertama di tabel
    cy.get('[data-testid="row-actions-edit"]').first().click();

    // 2. Verifikasi URL berubah menyertakan query param ?action=edit&id=...
    cy.url().should("include", "action=edit").and("include", "id=");

    // 3. Verifikasi formulir edit proyek terbuka dan tabel master tersembunyi
    cy.get('[data-testid="table-scroll-container"]').should("not.exist");
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 4. Verifikasi seluruh field mandatori terisi (pre-populated) dengan data asli
    cy.get('[data-testid="input-project-id-pm"]')
      .invoke("val")
      .should("not.be.empty");

    cy.get('[data-testid="input-tahun-kontrak"]')
      .invoke("val")
      .should("not.be.empty");

    cy.get('[data-testid="input-nama-proyek"]')
      .invoke("val")
      .should("not.be.empty");

    cy.get('[data-testid="input-nama-pelanggan"]')
      .invoke("val")
      .should("not.be.empty");

    cy.get('[data-testid="select-nama-mitra"]')
      .should("be.visible");
  });

  it("Test 5.2: tombol simpan perubahan (Save Changes) wajib nonaktif (disabled) pada kondisi awal (pristine)", () => {
    // 1. Buka formulir edit proyek pada baris pertama
    cy.get('[data-testid="row-actions-edit"]').first().click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Verifikasi tombol simpan bertuliskan 'Save Changes' dan berstatus disabled saat belum ada data yang diubah
    cy.get('[data-testid="btn-save-project"]')
      .should("be.visible")
      .and("be.disabled")
      .and("contain.text", "Save Changes");
  });

  it("Test 5.3: harus mengaktifkan tombol simpan saat form dirty dan mengkalkulasi ulang ID PM dengan retensi sequence asli", () => {
    // 1. Buka formulir edit proyek pada baris pertama
    cy.get('[data-testid="row-actions-edit"]').first().click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Ambil nilai ID PROJECT PM awal dan ekstrak 3 digit nomor sequence aslinya
    cy.get('[data-testid="input-project-id-pm"]')
      .invoke("val")
      .then((originalId) => {
        const originalIdStr = String(originalId);
        const seqMatch = originalIdStr.match(/(\d+)$/);
        const originalSeq = seqMatch ? seqMatch[1] : "001";

        // 3. Ubah Tahun Project ke tahun masa depan (misal: 2030)
        cy.get('[data-testid="input-tahun-kontrak"]').clear().type("2030");

        // 4. Verifikasi dirty state terpicu: tombol 'Save Changes' sekarang aktif (not disabled)
        cy.get('[data-testid="btn-save-project"]').should("not.be.disabled");

        // 5. Verifikasi ID PROJECT PM ter-update dengan prefix tahun baru 2030 namun nomor sequence asli tetap dipertahankan
        cy.get('[data-testid="input-project-id-pm"]')
          .invoke("val")
          .should("include", "2030")
          .and("include", originalSeq);
      });
  });

  it("Test 5.4: harus berhasil menyimpan perubahan data proyek dan memperbarui baris tabel dengan highlight", () => {
    const updatedProjectName = `Project Updated E2E ${Date.now()}`;

    // 1. Buka formulir edit proyek pada baris pertama
    cy.get('[data-testid="row-actions-edit"]').first().click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Lakukan perubahan pada field Nama Project
    cy.get('[data-testid="input-nama-proyek"]').clear().type(updatedProjectName);

    // 3. Klik tombol simpan perubahan
    cy.get('[data-testid="btn-save-project"]').click();

    // 4. Verifikasi notifikasi toast sukses pembaruan proyek muncul
    cy.get('[data-testid="toast-item"]')
      .should("be.visible")
      .and("contain.text", "Project Successfully Updated");

    // 5. Formulir tertutup dan halaman kembali ke tabel master repository
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.get('[data-testid="project-form"]').should("not.exist");

    // 6. Baris proyek yang baru diperbarui wajib tampil di tabel dengan nama baru dan highlight aktif
    cy.contains('[data-testid="table-row"]', updatedProjectName)
      .should("be.visible")
      .and("have.class", "bg-sky-50/90");
  });
});

