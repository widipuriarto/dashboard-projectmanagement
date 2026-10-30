describe("Skenario 2: Search Input, Scoped Column & Keyboard Shortcut", () => {
  beforeEach(() => {
    // Kunjungi halaman master repository sebelum setiap pengujian dijalankan
    cy.visit("/repository");
  });

  it("Test 2.1: harus melakukan pencarian global dan menyaring baris tabel secara real-time", () => {
    const searchInput = '[data-testid="search-input"]';

    // 1. Verifikasi baris awal tabel sudah termuat
    cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);

    // 2. Ambil cuplikan teks dari baris pertama untuk dijadikan kata kunci pencarian yang pasti ada
    cy.get('[data-testid="table-row"]')
      .first()
      .invoke("text")
      .then((firstRowText) => {
        const keyword = firstRowText.trim().substring(0, 4);

        // Ketik kata kunci pada input pencarian
        cy.get(searchInput).type(keyword);

        // Seluruh baris yang tersaring wajib memuat teks tersebut
        cy.get('[data-testid="table-row"]').each(($row) => {
          cy.wrap($row).invoke("text").should("include", keyword);
        });
      });

    // 3. Uji kata kunci acak yang tidak mungkin ada di database
    cy.get(searchInput).clear().type("__NON_EXISTENT_QUERY_XYZ999__");

    // 4. Tabel wajib menampilkan status kosong dengan pesan 'No project data available.'
    cy.get('[data-testid="table-row"]').should("not.exist");
    cy.get('[data-testid="table-empty-state"]')
      .should("be.visible")
      .and("contain.text", "No project data available.");
  });

  it("Test 2.2: harus membatasi pencarian hanya pada kolom yang dipilih (Scoped Search)", () => {
    const searchInput = '[data-testid="search-input"]';
    const columnDropdown = '[data-testid="search-column-dropdown"]';

    // 1. Deteksi nilai Witel riil yang ada pada baris pertama tabel (SJU, YJS, atau SJT)
    cy.get('[data-testid="table-row"]')
      .first()
      .invoke("text")
      .then((rowText) => {
        const availableWitels = ["SJU", "YJS", "SJT"];
        const matchedWitel = availableWitels.find((w) => rowText.includes(w)) || "SJU";

        // 2. Buka dropdown pemilihan kolom target pencarian
        cy.get(columnDropdown).click();

        // 3. Pilih kolom 'witel'
        cy.get('[data-testid="search-column-witel"]').click();

        // 4. Verifikasi placeholder input berubah menjadi "Search in Witel..."
        cy.get(searchInput)
          .invoke("attr", "placeholder")
          .should("include", "Witel");

        // 5. Cari kata kunci Witel riil
        cy.get(searchInput).type(matchedWitel);

        // 6. Setiap baris yang tampil wajib memiliki nilai witel tersebut
        cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);
        cy.get('[data-testid="table-row"]').each(($row) => {
          cy.wrap($row).invoke("text").should("include", matchedWitel);
        });

        // 7. Kembalikan target kolom ke "All Columns"
        cy.get(columnDropdown).click();
        cy.get('[data-testid="search-column-all"]').click();
        cy.get(searchInput)
          .invoke("attr", "placeholder")
          .should("eq", "Search all columns...");
      });
  });

  it("Test 2.3: harus memfokuskan search input saat tombol pintasan Ctrl+F ditekan", () => {
    const searchInput = '[data-testid="search-input"]';

    // 1. Klik area luar tabel untuk memastikan input tidak dalam kondisi fokus
    cy.get("body").click(10, 10);
    cy.get(searchInput).should("not.have.focus");

    // 2. Tekan kombinasi keyboard shortcut Ctrl+F
    cy.get("body").type("{ctrl}f");

    // 3. Verifikasi input pencarian langsung menerima fokus kursor
    cy.get(searchInput).should("have.focus");
  });

  it("Test 2.4: harus menghapus teks pencarian dan merestorasi tabel saat tombol clear diklik", () => {
    const searchInput = '[data-testid="search-input"]';
    const clearButton = '[data-testid="search-clear-button"]';

    // 1. Ketik teks pencarian
    cy.get(searchInput).type("Testing Query");
    cy.get(searchInput).should("have.value", "Testing Query");

    // 2. Tombol clear wajib muncul saat input terisi
    cy.get(clearButton).should("be.visible");

    // 3. Klik tombol clear
    cy.get(clearButton).click();

    // 4. Input wajib kosong kembali dan tombol clear otomatis menghilang
    cy.get(searchInput).should("have.value", "");
    cy.get(clearButton).should("not.exist");

    // 5. Tabel kembali menampilkan daftar baris data awal
    cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);
  });

  it("Test 2.5: harus mendukung scoped search pada kolom jenis_kontrak, jenis_layanan, dan id_digireview", () => {
    const searchInput = '[data-testid="search-input"]';
    const columnDropdown = '[data-testid="search-column-dropdown"]';

    // 1. Uji scoped search pada kolom 'Jenis Kontrak'
    cy.get(columnDropdown).click();
    cy.get('[data-testid="search-column-jenis_kontrak"]').click();
    cy.get(searchInput).invoke("attr", "placeholder").should("include", "Jenis Kontrak");
    cy.get(searchInput).clear().type("KL");
    cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);
    cy.get('[data-testid="table-row"]').each(($row) => {
      cy.wrap($row).invoke("text").should("match", /KL/i);
    });

    // 2. Uji scoped search pada kolom 'Jenis Layanan'
    cy.get(columnDropdown).click();
    cy.get('[data-testid="search-column-jenis_layanan"]').click();
    cy.get(searchInput).invoke("attr", "placeholder").should("include", "Jenis Layanan");
    cy.get(searchInput).clear().type("Jaringan");
    cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);
    cy.get('[data-testid="table-row"]').each(($row) => {
      cy.wrap($row).invoke("text").should("match", /Jaringan/i);
    });

    // 3. Uji scoped search pada kolom 'ID Digireview'
    cy.get(columnDropdown).click();
    cy.get('[data-testid="search-column-id_digireview"]').click();
    cy.get(searchInput).invoke("attr", "placeholder").should("include", "Digireview");
    cy.get(searchInput).clear().type("103878");
    cy.get('[data-testid="table-row"]').should("have.length.at.least", 1);
    cy.get('[data-testid="table-row"]').each(($row) => {
      cy.wrap($row).invoke("text").should("include", "103878");
    });

    // 4. Reset kembali ke All Columns
    cy.get(columnDropdown).click();
    cy.get('[data-testid="search-column-all"]').click();
    cy.get(searchInput).clear();
  });
});
