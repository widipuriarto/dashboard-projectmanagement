import * as React from "react";
import type { ProjectPM } from "@/types/project";
import {
  computeNextProjectSeq,
  formatProjectIdPm,
  allocateNextProjectCredentials,
} from "@/lib/projectSequence";

export interface UseProjectSequenceOptions {
  existingProjects?: ProjectPM[];
  initialData?: ProjectPM | null;
  isEditMode?: boolean;
  tahunKontrak: number | string | null;
  witel: string;
  segment: string;
}

export interface UseProjectSequenceReturn {
  nextProjectSeq: string;
  activeProjectSeq: string;
  generatedProjectId: string;
  allocateCredentials: () => Promise<{ finalProjectId: string; nextNomor: number }>;
}

/**
 * Custom hook encapsulating reactive project sequence computation and high-water mark allocation.
 */
export function useProjectSequence({
  existingProjects = [],
  initialData = null,
  isEditMode = false,
  tahunKontrak,
  witel,
  segment,
}: UseProjectSequenceOptions): UseProjectSequenceReturn {
  // Compute next sequential project index for create mode
  const nextProjectSeq = React.useMemo(() => {
    return computeNextProjectSeq(existingProjects);
  }, [existingProjects]);

  // In edit mode, retain original sequence number from initialData.project_id_pm
  const activeProjectSeq = React.useMemo(() => {
    if (isEditMode && initialData?.project_id_pm) {
      const match = String(initialData.project_id_pm).match(/(\d+)$/);
      if (match) {
        return match[1];
      }
    }
    return nextProjectSeq;
  }, [isEditMode, initialData, nextProjectSeq]);

  // Reactive dynamic project_id_pm string preview
  const generatedProjectId = React.useMemo(() => {
    return formatProjectIdPm(tahunKontrak, witel, segment, activeProjectSeq);
  }, [tahunKontrak, witel, segment, activeProjectSeq]);

  const allocateCredentials = React.useCallback(async () => {
    return allocateNextProjectCredentials(
      existingProjects,
      witel,
      segment,
      tahunKontrak
    );
  }, [existingProjects, witel, segment, tahunKontrak]);

  return {
    nextProjectSeq,
    activeProjectSeq,
    generatedProjectId,
    allocateCredentials,
  };
}

