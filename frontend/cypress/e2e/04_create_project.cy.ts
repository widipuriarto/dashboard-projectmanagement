describe("Skenario 4: Tambah Proyek Baru (CRUD: Create)", () => {
  beforeEach(() => {
    // Kunjungi halaman master repository sebelum setiap pengujian dijalankan
    cy.visit("/repository");
  });

  it("Test 4.1: harus melakukan morphing in-place dari tabel ke formulir proyek baru", () => {
    // 1. Verifikasi tabel terlihat di awal
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");

    // 2. Klik tombol '+ Add Project'
    cy.get('[data-testid="btn-add-project"]').click();

    // 3. Verifikasi URL berubah menyertakan query param ?action=create
    cy.url().should("include", "action=create");

    // 4. Tabel menghilang dan berganti dengan formulir proyek
    cy.get('[data-testid="table-scroll-container"]').should("not.exist");
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 5. Tombol aksi di toolbar berubah menjadi tombol 'Back'
    cy.get('[data-testid="btn-back"]').should("be.visible");
  });

  it("Test 4.2: harus memvalidasi 8 kolom mandatori saat submit formulir kosong", () => {
    // 1. Masuk ke formulir tambah proyek
    cy.get('[data-testid="btn-add-project"]').click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Klik tombol simpan tanpa mengisi field apapun
    cy.get('[data-testid="btn-save-project"]').click();

    // 3. Banner peringatan validasi merah bertanda (*) wajib muncul
    cy.get('[data-testid="form-validation-banner"]')
      .should("be.visible")
      .and("contain.text", "Kolom bertanda (*) wajib diisi");

    // 4. Form tetap terbuka dan tidak tersimpan
    cy.get('[data-testid="project-form"]').should("be.visible");
  });

  it("Test 4.3: harus mengkalkulasi ID PROJECT PM secara dinamis dan reaktif", () => {
    // 1. Masuk ke formulir tambah proyek
    cy.get('[data-testid="btn-add-project"]').click();

    // 2. Masukkan Tahun Kontrak
    cy.get('[data-testid="input-tahun-kontrak"]').clear().type("2027");

    // 3. Pilih Witel SMG JATENG UTARA
    cy.get('[data-testid="select-witel"]').click();
    cy.get('[data-testid="select-option-SMG JATENG UTARA"]').click();

    // 4. Pilih Segmen DPS
    cy.get('[data-testid="select-segment"]').click();
    cy.get('[data-testid="select-option-DPS"]').click();

    // 5. Verifikasi nilai ID PROJECT PM ter-update otomatis dengan format semantik 2027-SMG-DPS-XXX
    cy.get('[data-testid="input-project-id-pm"]')
      .invoke("val")
      .should("match", /^2027-SMG-DPS-\d{3}$/);
  });

  it("Test 4.4: harus memformat input mata uang (CurrencyInput) dengan pemisah ribuan", () => {
    // 1. Masuk ke formulir tambah proyek
    cy.get('[data-testid="btn-add-project"]').click();

    // 2. Ketik angka nominal kontrak OBL tanpa pemisah
    cy.get('[data-testid="input-nilai-kontrak-obl"]').type("150000000");

    // 3. Verifikasi input otomatis menampilkan pemisah ribuan Rupiah
    cy.get('[data-testid="input-nilai-kontrak-obl"]').should("have.value", "150.000.000");
  });

  it("Test 4.5: harus berhasil menyimpan proyek baru dan menampilkan highlight selama 5 detik", () => {
    const uniqueTimestamp = Date.now();
    const testProjectName = `Project E2E Test ${uniqueTimestamp}`;
    const testCustomer = "PT Pelanggan Otomasi Cypress";
    const testPartner = "PT Mitra Otomasi Cypress";

    // 1. Masuk ke formulir tambah proyek
    cy.get('[data-testid="btn-add-project"]').click();

    // 2. Isi seluruh 8 field mandatori:
    // Field 1: Tahun Kontrak
    cy.get('[data-testid="input-tahun-kontrak"]').clear().type("2027");

    // Field 2: Witel
    cy.get('[data-testid="select-witel"]').click();
    cy.get('[data-testid="select-option-SMG JATENG UTARA"]').click();

    // Field 3: Segmen
    cy.get('[data-testid="select-segment"]').click();
    cy.get('[data-testid="select-option-DPS"]').click();

    // Field 4: Nama Proyek
    cy.get('[data-testid="input-nama-proyek"]').type(testProjectName);

    // Field 5: Nama Pelanggan
    cy.get('[data-testid="input-nama-pelanggan"]').type(testCustomer);

    // Field 6: Nama Mitra
    cy.get('[data-testid="select-nama-mitra"]').click();
    cy.get('[data-testid="select-option-TELKOMSEL"]').click();

    // Field 7: Status Email Handover
    cy.get('[data-testid="select-status-email-handover"]').click();
    cy.get('[data-testid="select-option-OK"]').click();

    // Field 8: Status Dokumen OBL
    cy.get('[data-testid="select-status-dokumen-obl"]').click();
    cy.contains("button", "KL/NOPES OK").click();

    // 3. Isi data pendukung (Nilai Kontrak)
    cy.get('[data-testid="input-nilai-kontrak-obl"]').type("250000000");

    // 4. Klik tombol simpan proyek
    cy.get('[data-testid="btn-save-project"]').click();

    // 5. Toast notifikasi sukses wajib muncul
    cy.get('[data-testid="toast-item"]')
      .should("be.visible")
      .and("contain.text", "Project Successfully Added");

    // 6. Formulir otomatis tertutup dan tampilan kembali ke tabel master repository
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.get('[data-testid="project-form"]').should("not.exist");

    // 7. Baris proyek baru wajib terlihat di tabel dan memiliki highlight biru
    cy.contains('[data-testid="table-row"]', testProjectName)
      .should("be.visible")
      .and("have.class", "bg-sky-50/90");
  });
});

