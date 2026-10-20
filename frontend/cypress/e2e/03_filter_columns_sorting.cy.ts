describe("Skenario 3: Multi-Category Filter, Column Visibility & Sorting Persistence", () => {
  beforeEach(() => {
    // Kunjungi halaman master repository sebelum setiap pengujian dijalankan
    cy.visit("/repository");
  });

  it("Test 3.1: harus mengaktifkan filter kategori dan memunculkan active filter chips", () => {
    const filterBtn = '[data-testid="filter-button"]:visible';

    // 1. Buka popover filter
    cy.get(filterBtn).click();

    // 2. Pilih kategori Witel
    cy.get('[data-testid="filter-category-witel"]').click();

    // 3. Centang opsi filter pertama yang tersedia
    cy.get('[data-testid^="filter-option-"]')
      .first()
      .invoke("text")
      .then((optionText) => {
        // Ambil nama nilai filter (tanpa angka hitungan)
        const optionVal = optionText.replace(/\(\d+\)/, "").trim();

        // Klik opsi filter untuk mencentang
        cy.get('[data-testid^="filter-option-"]').first().click();

        // 4. Tutup popover filter dengan menekan Escape
        cy.get("body").type("{esc}");

        // 5. Verifikasi chip aktif muncul di toolbar dengan nama filter yang dipilih
        cy.contains(optionVal).should("be.visible");

        // 6. Verifikasi badge hitungan filter aktif pada tombol filter
        cy.get(filterBtn).should("contain.text", "1");
      });
  });

  it("Test 3.2: harus mereset seluruh filter saat tombol 'Clear all' diklik", () => {
    const filterBtn = '[data-testid="filter-button"]:visible';
    const clearAllBtn = '[data-testid="clear-all-filters"]';

    // 1. Buka filter dan pilih salah satu opsi agar chip aktif muncul
    cy.get(filterBtn).click();
    cy.get('[data-testid="filter-category-witel"]').click();
    cy.get('[data-testid^="filter-option-"]').first().click();
    cy.get("body").type("{esc}");

    // 2. Verifikasi tombol Clear all muncul di toolbar
    cy.get(clearAllBtn).should("be.visible");

    // 3. Klik tombol Clear all
    cy.get(clearAllBtn).click();

    // 4. Verifikasi tombol Clear all dan chip filter otomatis hilang
    cy.get(clearAllBtn).should("not.exist");

    // 5. Seluruh baris data kembali termuat lengkap
    cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);
  });

  it("Test 3.3: harus mengatur visibilitas kolom dan mengunci kolom mandatori", () => {
    const columnsBtn = '[data-testid="columns-button"]:visible';

    // 1. Buka popover pengaturan visibilitas kolom
    cy.get(columnsBtn).click();

    // 2. Verifikasi 3 kolom mandatori (Aksi, No., ID Project PM) memiliki checkbox disabled
    cy.get('[data-testid="column-mandatory-actions"]')
      .find('[role="checkbox"]')
      .should("be.disabled");

    cy.get('[data-testid="column-mandatory-nomor"]')
      .find('[role="checkbox"]')
      .should("be.disabled");

    cy.get('[data-testid="column-mandatory-project_id_pm"]')
      .find('[role="checkbox"]')
      .should("be.disabled");

    // 3. Sembunyikan salah satu kolom opsional (misal: 'idlop')
    cy.get('[data-testid="column-item-idlop"]').click();

    // 4. Tutup popover kolom
    cy.get("body").type("{esc}");

    // 5. Header kolom IDLOP wajib tidak lagi tampak di tabel
    cy.get("table thead").should("not.contain.text", "IDLOP");

    // 6. Buka kembali dan klik Reset untuk mengembalikan kolom ke posisi awal
    cy.get(columnsBtn).click();
    cy.get('[data-testid="columns-reset"]').click();
    cy.get("body").type("{esc}");
  });

  it("Test 3.4: harus mempertahankan state sorting di LocalStorage setelah refresh halaman", () => {
    const sortBtn = '[data-testid="sort-project-id"]';

    // 1. Klik tombol sorting pada kolom ID Project PM untuk mengubah urutan
    cy.get(sortBtn).click();

    // 2. Verifikasi state sorting tersimpan di localStorage browser
    cy.window().then((win) => {
      const storedSorting = win.localStorage.getItem("pm_rso1_column_sorting");
      expect(storedSorting).to.not.be.null;
      const parsed = JSON.parse(storedSorting || "[]");
      expect(parsed.length).to.be.at.least(1);
      expect(parsed[0].id).to.eq("project_id_pm");
    });

    // 3. Lakukan reload / refresh halaman browser
    cy.reload();

    // 4. Setelah refresh, verifikasi state sorting di localStorage tetap ada dan persisten
    cy.window().then((win) => {
      const storedSorting = win.localStorage.getItem("pm_rso1_column_sorting");
      expect(storedSorting).to.not.be.null;
      const parsed = JSON.parse(storedSorting || "[]");
      expect(parsed[0].id).to.eq("project_id_pm");
    });

    // 5. Baris tabel tetap ter-render secara normal dengan urutan yang tersimpan
    cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);
  });
});

