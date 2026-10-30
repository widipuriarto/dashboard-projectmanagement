import type { Column } from "@tanstack/react-table";
import type { ProjectPM } from "@/types/project";
import { DataTableSortHeader } from "./DataTableSortHeader";

export interface ProjectIdSortHeaderProps {
  column: Column<ProjectPM, unknown>;
}

/**
 * Header cell molecule with ascending/descending sort toggle button for Project ID PM.
 */
export function ProjectIdSortHeader({ column }: ProjectIdSortHeaderProps) {
  return (
    <DataTableSortHeader
      column={column}
      title="ID PROJECT PM"
      align="center"
      testId="sort-project-id"
    />
  );
}
