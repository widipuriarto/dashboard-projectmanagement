import type { ProjectPM } from "@/types/project";
import {
  STORAGE_KEY_HIGHEST_SEQ,
  STORAGE_KEY_HIGHEST_NOMOR,
} from "@/lib/table-constants";
import { getWitelCode } from "@/components/molecules/project-form/types";
import { supabase } from "@/lib/supabase";

/**
 * Extracts the trailing numeric sequence number from project_id_pm (e.g. "2026-SLO-DBS-042" -> 42).
 */
export function extractProjectSeqNumber(id?: string | null): number {
  if (!id) return 0;
  const match = String(id).match(/(\d+)$/);
  return match ? parseInt(match[0], 10) : 0;
}

/**
 * Stable comparator sorting projects in ascending sequence order, with nomor as tie-breaker.
 */
export function compareProjectsBySeq(a: ProjectPM, b: ProjectPM): number {
  const numA = extractProjectSeqNumber(a.project_id_pm);
  const numB = extractProjectSeqNumber(b.project_id_pm);
  if (numA !== numB) {
    return numA - numB;
  }
  const nomA = typeof a.nomor === "number" ? a.nomor : parseInt(String(a.nomor || 0), 10);
  const nomB = typeof b.nomor === "number" ? b.nomor : parseInt(String(b.nomor || 0), 10);
  return (isNaN(nomA) ? 0 : nomA) - (isNaN(nomB) ? 0 : nomB);
}

/**
 * Scans a project dataset, finds high-water marks, and synchronizes them to localStorage.
 */
export function syncHighWaterMarks(projects: ProjectPM[]): { maxSeq: number; maxNomor: number } {
  let maxSeq = 0;
  let maxNomor = 0;

  projects.forEach((p) => {
    const seq = extractProjectSeqNumber(p.project_id_pm);
    if (seq > maxSeq) maxSeq = seq;

    const nm = typeof p.nomor === "number" ? p.nomor : parseInt(String(p.nomor), 10);
    if (!isNaN(nm) && nm > maxNomor) maxNomor = nm;
  });

  if (typeof window !== "undefined") {
    try {
      const storedSeq = parseInt(localStorage.getItem(STORAGE_KEY_HIGHEST_SEQ) || "0", 10);
      if (maxSeq > storedSeq) {
        localStorage.setItem(STORAGE_KEY_HIGHEST_SEQ, String(maxSeq));
      }
      const storedNomor = parseInt(localStorage.getItem(STORAGE_KEY_HIGHEST_NOMOR) || "0", 10);
      if (maxNomor > storedNomor) {
        localStorage.setItem(STORAGE_KEY_HIGHEST_NOMOR, String(maxNomor));
      }
    } catch (e) {
      console.error("Failed to synchronize high-water marks to localStorage", e);
    }
  }

  return { maxSeq, maxNomor };
}

/**
 * Computes the next 3-digit zero-padded sequence string for new project creation.
 */
export function computeNextProjectSeq(existingProjects: ProjectPM[] = []): string {
  let max = 0;
  existingProjects.forEach((p) => {
    const seq = extractProjectSeqNumber(p.project_id_pm);
    if (seq > max) max = seq;
  });

  let storedMax = 0;
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HIGHEST_SEQ);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > storedMax) storedMax = parsed;
      }
    } catch (e) {
      console.error("Failed to read highest sequence from localStorage", e);
    }
  }

  const effectiveMax = Math.max(max, storedMax);
  if (typeof window !== "undefined" && effectiveMax > storedMax) {
    try {
      localStorage.setItem(STORAGE_KEY_HIGHEST_SEQ, String(effectiveMax));
    } catch (e) {
      console.error("Failed to update highest sequence in localStorage", e);
    }
  }

  return String(effectiveMax + 1).padStart(3, "0");
}

/**
 * Generates the standardized project_id_pm string from components.
 */
export function formatProjectIdPm(
  tahunKontrak: number | string | null,
  witel: string,
  segment: string,
  sequence: string
): string {
  const y = tahunKontrak || "YYYY";
  const w = getWitelCode(witel);
  const s = segment || "SEGMENT";
  return `${y}-${w}-${s}-${sequence}`;
}

/**
 * Allocates strictly monotonic forward sequence number and nomor for database insertion.
 */
export async function allocateNextProjectCredentials(
  existingProjects: ProjectPM[] = [],
  witel: string,
  segment: string,
  tahunKontrak: number | string | null
): Promise<{ finalProjectId: string; nextNomor: number }> {
  let maxProjectSeq = 0;
  existingProjects.forEach((p) => {
    const seq = extractProjectSeqNumber(p.project_id_pm);
    if (seq > maxProjectSeq) maxProjectSeq = seq;
  });

  // Query database for recent inserts by other sessions
  try {
    const { data: latestProjects } = await supabase
      .from("projects")
      .select("project_id_pm")
      .order("created_at", { ascending: false })
      .limit(30);

    if (latestProjects) {
      latestProjects.forEach((p) => {
        const seq = extractProjectSeqNumber(p.project_id_pm);
        if (seq > maxProjectSeq) maxProjectSeq = seq;
      });
    }
  } catch (seqErr) {
    console.warn("Could not query latest project sequence, using local maximum", seqErr);
  }

  if (typeof window !== "undefined") {
    try {
      const savedSeq = localStorage.getItem(STORAGE_KEY_HIGHEST_SEQ);
      if (savedSeq) {
        const parsed = parseInt(savedSeq, 10);
        if (!isNaN(parsed) && parsed > maxProjectSeq) maxProjectSeq = parsed;
      }
    } catch (e) {
      console.error("Failed to read highest sequence from localStorage", e);
    }
  }

  const finalSeqNum = maxProjectSeq + 1;
  const finalSeqStr = String(finalSeqNum).padStart(3, "0");
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_HIGHEST_SEQ, String(finalSeqNum));
    } catch (e) {
      console.error("Failed to update highest sequence in localStorage", e);
    }
  }

  const finalProjectId = formatProjectIdPm(tahunKontrak, witel, segment, finalSeqStr);

  // Compute strictly monotonic nomor
  let maxNomor = 0;
  existingProjects.forEach((p) => {
    const n = typeof p.nomor === "number" ? p.nomor : parseInt(String(p.nomor), 10);
    if (!isNaN(n) && n > maxNomor) maxNomor = n;
  });

  if (typeof window !== "undefined") {
    try {
      const savedNomor = localStorage.getItem(STORAGE_KEY_HIGHEST_NOMOR);
      if (savedNomor) {
        const parsed = parseInt(savedNomor, 10);
        if (!isNaN(parsed) && parsed > maxNomor) maxNomor = parsed;
      }
    } catch (e) {
      console.error("Failed to read highest nomor from localStorage", e);
    }
  }

  const nextNomor = maxNomor + 1;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY_HIGHEST_NOMOR, String(nextNomor));
    } catch (e) {
      console.error("Failed to update highest nomor in localStorage", e);
    }
  }

  return { finalProjectId, nextNomor };
}

