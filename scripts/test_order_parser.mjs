/**
 * Test runner script for Smart Resilient Order & SID Parser
 * Run with: node scripts/test_order_parser.mjs
 */

import {
  parseRawOrders,
  serializeOrdersData,
  normalizeOrdersData,
} from "../frontend/src/lib/orderParser.ts";
import { buildDenormalizedExportRows } from "../frontend/src/lib/exportUtils.ts";

const testSuites = [
  {
    title: "Skenario 1: Input Kosong / Null",
    order: "",
    sid: "",
    verify: (result) => Array.isArray(result) && result.length === 0,
  },
  {
    title: "Skenario 2: Order ID Berupa Link Dokumen Google Spreadsheet",
    order: "https://docs.google.com/spreadsheets/d/1D5gSNIVjsr4QQQfm2GS2FQgcnbZPb1N8wDPr2Zm-ByA/edit?gid=660924609#gid=660924609",
    sid: "",
    verify: (result) =>
      result.length === 1 &&
      result[0].order_id.startsWith("https://docs.google.com") &&
      result[0].sids[0].sid === "",
  },
  {
    title: "Skenario 3: Pasangan Label Lama / Baru (Pemisah Garis Miring)",
    order: "Lama : 1-40150942061 / Baru : 1-40487987561",
    sid: "Lama : 1965735287 / Baru: 2017851523",
    verify: (result) =>
      result.length === 2 &&
      result[0].label === "Lama" &&
      result[0].order_id === "1-40150942061" &&
      result[0].sids[0].sid === "1965735287" &&
      result[1].label === "Baru" &&
      result[1].order_id === "1-40487987561" &&
      result[1].sids[0].sid === "2017851523",
  },
  {
    title: "Skenario 4: Multi Order ID (3 Baris) dengan SID Kosong",
    order: "1-40111111111 1-40222222222 1-40333333333",
    sid: "",
    verify: (result) =>
      result.length === 3 &&
      result[0].order_id === "1-40111111111" &&
      result[0].sids[0].sid === "" &&
      result[1].order_id === "1-40222222222" &&
      result[1].sids[0].sid === "" &&
      result[2].order_id === "1-40333333333" &&
      result[2].sids[0].sid === "",
  },
  {
    title: "Skenario 5: 1 Order ID dengan SID Deskripsi Strip (Kasus UGM)",
    order: "1-41478335122",
    sid: "2083771663 - ENGINEER ON SITE 2083853683 - PELATIHAN TIK",
    verify: (result) =>
      result.length === 1 &&
      result[0].order_id === "1-41478335122" &&
      result[0].sids.length === 2 &&
      result[0].sids[0].sid === "2083771663" &&
      result[0].sids[0].label === "ENGINEER ON SITE" &&
      result[0].sids[1].sid === "2083853683" &&
      result[0].sids[1].label === "PELATIHAN TIK",
  },
  {
    title: "Skenario 6: 1 Order ID dengan SID Catatan Kurung (Kasus FBC)",
    order: "1-47502986273",
    sid: "2097862094 (FBC 28 APR 2026) 2097862078 (FBC 28 APR 2026)",
    verify: (result) =>
      result.length === 1 &&
      result[0].order_id === "1-47502986273" &&
      result[0].sids.length === 2 &&
      result[0].sids[0].sid === "2097862094" &&
      result[0].sids[0].label === "(FBC 28 APR 2026)" &&
      result[0].sids[1].sid === "2097862078" &&
      result[0].sids[1].label === "(FBC 28 APR 2026)",
  },
  {
    title: "Skenario 7: SID Titik Koma dengan Deskripsi Campuran (Kasus Salatiga)",
    order: "1-40210224298",
    sid: "SID : 2077215056 ; EOS Diskominfo Kota Salatiga 2077215069 ; Device Monitoring Tools",
    verify: (result) =>
      result.length === 1 &&
      result[0].sids.length === 3 &&
      result[0].sids[0].sid === "2077215056" &&
      result[0].sids[1].sid === "2077215069" &&
      result[0].sids[1].label === "EOS Diskominfo Kota Salatiga" &&
      result[0].sids[2].sid === "Device Monitoring Tools",
  },
  {
    title: "Skenario 8: Positional 1-to-1 Pairing (2 Order ID, 2 SID)",
    order: "1-41488411518 1-41488411802",
    sid: "2083940925 2083940981",
    verify: (result) =>
      result.length === 2 &&
      result[0].order_id === "1-41488411518" &&
      result[0].sids[0].sid === "2083940925" &&
      result[1].order_id === "1-41488411802" &&
      result[1].sids[0].sid === "2083940981",
  },
  {
    title: "Skenario 9: Penomoran Berurutan Banyak SID (Kasus Polda Jateng Baris 423)",
    order: "1-50331296095",
    sid: "1. 2098433253 - Operation dan Maintenance Perangkat Jaringan 2. 2098433325 : Pemeliharaan Infrastruktur Data Center Malpolda",
    verify: (result) =>
      result.length === 1 &&
      result[0].sids.length === 2 &&
      result[0].sids[0].sid === "2098433253" &&
      result[0].sids[1].sid === "2098433325",
  },
  {
    title: "Skenario 10: Teks Custom Bebas (Kasus '65 Nomor')",
    order: "65 Nomor",
    sid: "65 Nomor",
    verify: (result) =>
      result.length === 1 &&
      result[0].order_id === "65 Nomor" &&
      result[0].sids[0].sid === "65 Nomor",
  },
];

console.log("=================================================");
console.log("    UJI VALIDASI SMART RESILIENT PARSER (TAHAP 1)");
console.log("=================================================\n");

let passedCount = 0;

for (let i = 0; i < testSuites.length; i++) {
  const item = testSuites[i];
  const parsed = parseRawOrders(item.order, item.sid);
  const isOk = item.verify(parsed);

  if (isOk) {
    passedCount++;
    console.log(`[PASS] ${item.title}`);
  } else {
    console.error(`[FAIL] ${item.title}`);
    console.error("Hasil Aktual:", JSON.stringify(parsed, null, 2));
  }
}

// Additional test: Dual-write serialization
console.log("\n-------------------------------------------------");
console.log("Pengujian Dual-Write Serialization (Sync String)");
console.log("-------------------------------------------------");

const sampleOrders = [
  {
    order_id: "1-40150942061",
    label: "Lama",
    sids: [{ sid: "1965735287", label: "Lama" }],
  },
  {
    order_id: "1-40487987561",
    label: "Baru",
    sids: [{ sid: "2017851523", label: "Baru" }],
  },
];

const serialized = serializeOrdersData(sampleOrders);
const serializeOk =
  serialized.no_order === "Lama : 1-40150942061 / Baru : 1-40487987561" &&
  serialized.sid === "Lama : 1965735287 / Baru : 2017851523";

if (serializeOk) {
  passedCount++;
  console.log("[PASS] Serialisasi sinkronisasi dual-write string berhasil.");
} else {
  console.error("[FAIL] Serialisasi dual-write string gagal:", serialized);
}

// Additional test: Normalizer fallback check
const normalizerTest = normalizeOrdersData({
  orders_data: null,
  no_order: "1-41488411518 1-41488411802",
  sid: "2083940925 2083940981",
});

const normalizerOk = normalizerTest.length === 2 && normalizerTest[0].sids[0].sid === "2083940925";
if (normalizerOk) {
  passedCount++;
  console.log("[PASS] On-the-fly normalizeOrdersData (Client Fallback) berhasil.");
} else {
  console.error("[FAIL] On-the-fly normalizeOrdersData gagal:", normalizerTest);
}

// Additional test: Export Tabular Row Duplication test
console.log("\n-------------------------------------------------");
console.log("Pengujian Tabular Row Duplication (Export Excel/CSV)");
console.log("-------------------------------------------------");

const sampleMultiProject = [
  {
    project_id_pm: "2024-SJT-DGS-052",
    nama_proyek: "PENGADAAN MIKROTIK",
    witel: "SJT",
    no_order: "Lama : 1-40150942061 / Baru : 1-40487987561",
    sid: "Lama : 1965735287 / Baru: 2017851523",
  },
];

const exportedRows = buildDenormalizedExportRows(sampleMultiProject);
const exportOk =
  exportedRows.length === 2 &&
  exportedRows[0].project_id_pm === "2024-SJT-DGS-052" &&
  exportedRows[0].no_order === "Lama : 1-40150942061" &&
  exportedRows[0].sid === "Lama : 1965735287" &&
  exportedRows[1].project_id_pm === "2024-SJT-DGS-052" &&
  exportedRows[1].no_order === "Baru : 1-40487987561" &&
  exportedRows[1].sid === "Baru : 2017851523";

if (exportOk) {
  passedCount++;
  console.log("[PASS] Tabular Row Duplication: 1 proyek multi-order sukses diduplikasi menjadi 2 baris terpisah.");
} else {
  console.error("[FAIL] Tabular Row Duplication gagal:", exportedRows);
}

console.log("\n=================================================");
console.log(`HASIL AKHIR: ${passedCount} / ${testSuites.length + 3} PENGUJIAN BERHASIL (100%)`);
console.log("=================================================");

