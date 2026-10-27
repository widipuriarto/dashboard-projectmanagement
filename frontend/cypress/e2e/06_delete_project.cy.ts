describe("Skenario 6: Hapus Proyek (CRUD: Delete)", () => {
  beforeEach(() => {
    // Kunjungi halaman master repository dan pastikan data tabel telah termuat
    cy.visit("/repository");
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.get('[data-testid="table-row"]').should("have.length.gt", 0);
  });

  it("Test 6.1: modal konfirmasi hapus wajib muncul saat tombol aksi hapus diklik", () => {
    // 1. Klik tombol aksi hapus pada baris pertama di tabel
    cy.get('[data-testid="table-row"]')
      .first()
      .within(() => {
        cy.get('[data-testid="row-actions-delete"]').click();
      });

    // 2. Modal konfirmasi hapus wajib muncul di layar dengan pesan konfirmasi
    cy.get('[data-testid="delete-confirmation-modal"]')
      .should("be.visible")
      .and("contain.text", "Delete Project?")
      .and("contain.text", "Are you sure you want to delete");

    // 3. Tombol aksi modal (Cancel dan Delete) wajib tampil
    cy.get('[data-testid="delete-modal-cancel"]').should("be.visible");
    cy.get('[data-testid="delete-modal-confirm"]').should("be.visible");

    // 4. Tutup modal menggunakan tombol Cancel untuk membersihkan state
    cy.get('[data-testid="delete-modal-cancel"]').click();
    cy.get('[data-testid="delete-confirmation-modal"]').should("not.exist");
  });

  it("Test 6.2: harus membatalkan penghapusan saat tombol 'Cancel' atau tombol 'Escape' ditekan", () => {
    // 1. Klik tombol aksi hapus pada baris pertama
    cy.get('[data-testid="row-actions-delete"]').first().click();
    cy.get('[data-testid="delete-confirmation-modal"]').should("be.visible");

    // 2. Batalkan melalui tombol 'Cancel'
    cy.get('[data-testid="delete-modal-cancel"]').click();

    // 3. Verifikasi modal tertutup dan data tabel tetap utuh
    cy.get('[data-testid="delete-confirmation-modal"]').should("not.exist");
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.get('[data-testid="table-row"]').should("have.length.gt", 0);

    // 4. Buka kembali modal konfirmasi hapus
    cy.get('[data-testid="row-actions-delete"]').first().click();
    cy.get('[data-testid="delete-confirmation-modal"]').should("be.visible");

    // 5. Tekan tombol keyboard 'Escape'
    cy.get("body").type("{esc}");

    // 6. Verifikasi modal tertutup kembali melalui event listener Escape
    cy.get('[data-testid="delete-confirmation-modal"]').should("not.exist");
  });

  it("Test 6.3: harus mengeksekusi penghapusan proyek secara permanen dan memperbarui tabel secara real-time", () => {
    const uniqueTimestamp = Date.now();
    const testProjectName = `Project E2E Delete ${uniqueTimestamp}`;

    // 1. Tambah proyek baru khusus untuk pengujian alur penghapusan terisolasi
    cy.get('[data-testid="btn-add-project"]').click();
    cy.get('[data-testid="project-form"]').should("be.visible");

    // 2. Isi seluruh field mandatori
    cy.get('[data-testid="input-tahun-kontrak"]').clear().type("2028");

    cy.get('[data-testid="select-witel"]').click();
    cy.get('[data-testid="select-option-SMG JATENG UTARA"]').click();

    cy.get('[data-testid="select-segment"]').click();
    cy.get('[data-testid="select-option-DPS"]').click();

    cy.get('[data-testid="input-nama-proyek"]').type(testProjectName);
    cy.get('[data-testid="input-nama-pelanggan"]').type("PT Pelanggan Hapus Otomasi");
    cy.get('[data-testid="select-nama-mitra"]').click();
    cy.get('[data-testid="select-option-TELKOMSEL"]').click();

    cy.get('[data-testid="select-status-email-handover"]').click();
    cy.get('[data-testid="select-option-OK"]').click();

    cy.get('[data-testid="select-status-dokumen-obl"]').click();
    cy.contains("button", "KL/NOPES OK").click();

    // 3. Simpan proyek
    cy.get('[data-testid="btn-save-project"]').click();

    // 4. Pastikan proyek tampil pada tabel master repository
    cy.get('[data-testid="table-scroll-container"]').should("be.visible");
    cy.contains('[data-testid="table-row"]', testProjectName).should("be.visible");

    // 5. Buka modal konfirmasi hapus khusus pada baris proyek yang baru dibuat
    cy.contains('[data-testid="table-row"]', testProjectName).within(() => {
      cy.get('[data-testid="row-actions-delete"]').click();
    });

    // 6. Verifikasi modal konfirmasi menampilkan nama proyek yang tepat
    cy.get('[data-testid="delete-confirmation-modal"]')
      .should("be.visible")
      .and("contain.text", testProjectName);

    // 7. Klik tombol 'Delete' untuk mengonfirmasi penghapusan permanen
    cy.get('[data-testid="delete-modal-confirm"]').click();

    // 8. Verifikasi toast notifikasi sukses penghapusan muncul
    cy.get('[data-testid="toast-item"]')
      .should("be.visible")
      .and("contain.text", "Project Successfully Deleted");

    // 9. Verifikasi modal konfirmasi tertutup
    cy.get('[data-testid="delete-confirmation-modal"]').should("not.exist");

    // 10. Verifikasi baris proyek tersebut terhapus secara real-time dari tabel
    cy.contains('[data-testid="table-row"]', testProjectName).should("not.exist");
  });
});

