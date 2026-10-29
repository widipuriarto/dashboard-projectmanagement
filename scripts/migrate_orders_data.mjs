/**
 * Data migration script to backfill orders_data JSONB column
 * Run with: node --experimental-strip-types scripts/migrate_orders_data.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { createClient } from "../frontend/node_modules/@supabase/supabase-js/dist/index.mjs";
import { parseRawOrders } from "../frontend/src/lib/orderParser.ts";

// Read environment variables from backend/.env or frontend/.env.local
function getEnvConfig() {
  const rootDir = process.cwd();
  const backendEnvPath = path.join(rootDir, "backend", ".env");
  const frontendEnvPath = path.join(rootDir, "frontend", ".env.local");

  let url = "";
  let key = "";

  if (fs.existsSync(backendEnvPath)) {
    const content = fs.readFileSync(backendEnvPath, "utf-8");
    const urlMatch = content.match(/SUPABASE_URL=([^\r\n]+)/);
    const keyMatch = content.match(/SUPABASE_SERVICE_KEY=([^\r\n]+)/);
    if (urlMatch) url = urlMatch[1].trim().replace(/\/rest\/v1\/?$/, "");
    if (keyMatch) key = keyMatch[1].trim();
  }

  if (!url || !key) {
    if (fs.existsSync(frontendEnvPath)) {
      const content = fs.readFileSync(frontendEnvPath, "utf-8");
      const urlMatch = content.match(/VITE_SUPABASE_URL=([^\r\n]+)/);
      const keyMatch = content.match(/VITE_SUPABASE_ANON_KEY=([^\r\n]+)/);
      if (urlMatch) url = urlMatch[1].trim();
      if (keyMatch) key = keyMatch[1].trim();
    }
  }

  return { url, key };
}

async function runMigration() {
  console.log("=================================================");
  console.log("   MIGRASI DATA: POPULATE ORDERS_DATA JSONB      ");
  console.log("=================================================\n");

  const { url, key } = getEnvConfig();

  if (!url || !key) {
    console.error("[ERROR] Supabase URL atau Key tidak ditemukan di backend/.env maupun frontend/.env.local");
    process.exit(1);
  }

  console.log(`Menghubungkan ke Supabase: ${url}`);
  const supabase = createClient(url, key);

  // 1. Fetch total count of projects
  const { count, error: countError } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("[ERROR] Gagal membaca data projects:", countError.message);
    process.exit(1);
  }

  console.log(`Total baris proyek di database: ${count} baris.\n`);

  // 2. Fetch all projects in chunks of 100
  const CHUNK_SIZE = 100;
  let offset = 0;
  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  while (offset < (count || 0)) {
    const { data: rows, error: fetchError } = await supabase
      .from("projects")
      .select("id, nomor, project_id_pm, no_order, sid, orders_data")
      .range(offset, offset + CHUNK_SIZE - 1);

    if (fetchError) {
      console.error(`[ERROR] Gagal mengambil batch ${offset} - ${offset + CHUNK_SIZE}:`, fetchError.message);
      break;
    }

    if (!rows || rows.length === 0) break;

    for (const row of rows) {
      totalProcessed++;

      // Skip if already has structured orders_data populated
      if (Array.isArray(row.orders_data) && row.orders_data.length > 0) {
        totalSkipped++;
        continue;
      }

      // Parse legacy strings
      const parsedOrders = parseRawOrders(row.no_order, row.sid);

      // Perform update
      const identifier = row.id ? { col: "id", val: row.id } : { col: "nomor", val: row.nomor };
      const { error: updateError } = await supabase
        .from("projects")
        .update({ orders_data: parsedOrders })
        .eq(identifier.col, identifier.val);

      if (updateError) {
        console.error(`[FAIL] Gagal update proyek ${row.project_id_pm || row.nomor}:`, updateError.message);
        totalErrors++;
      } else {
        totalUpdated++;
      }
    }

    console.log(`[PROGRESS] Selesai memproses ${Math.min(offset + CHUNK_SIZE, count || 0)} / ${count} baris...`);
    offset += CHUNK_SIZE;
  }

  console.log("\n=================================================");
  console.log("             RINGKASAN HASIL MIGRASI             ");
  console.log("=================================================");
  console.log(`Total Proyek Diperiksa : ${totalProcessed}`);
  console.log(`Total Berhasil Diupdate : ${totalUpdated}`);
  console.log(`Total Dilewati (Sudah Ada): ${totalSkipped}`);
  console.log(`Total Error             : ${totalErrors}`);
  console.log("=================================================\n");
}

runMigration().catch((err) => {
  console.error("[FATAL ERROR]:", err);
  process.exit(1);
});

