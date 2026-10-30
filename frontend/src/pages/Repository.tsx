import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "@/components/organisms/DataTable";
import { columns } from "@/components/organisms/columns";
import type { ProjectPM } from "@/types/project";
import { compareProjectsBySeq, syncHighWaterMarks } from "@/lib/projectSequence";
import { ProjectForm, type ProjectFormHandle } from "@/components/organisms/ProjectForm";
import { DeleteConfirmationModal } from "@/components/molecules/DeleteConfirmationModal";
import { RestoreConfirmationModal } from "@/components/molecules/RestoreConfirmationModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";

export default function Repository() {
  const [data, setData] = useState<ProjectPM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [highlightVariant, setHighlightVariant] = useState<"sky" | "grey">("sky");
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals state for Delete and Restore
  const [projectToDelete, setProjectToDelete] = useState<ProjectPM | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [projectToRestore, setProjectToRestore] = useState<ProjectPM | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const lastRestoredIdRef = useRef<string | null>(null);

  const projectFormRef = useRef<ProjectFormHandle>(null);
  const { showToast } = useToast();

  const triggerRowHighlight = useCallback((id: string, variant: "sky" | "grey" = "sky") => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedRowId(id);
    setHighlightVariant(variant);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedRowId(null);
      setHighlightVariant("sky");
    }, 5000);
  }, []);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const actionParam = searchParams.get("action");
  const editId = searchParams.get("id");
  const viewParam = searchParams.get("view");
  const isTrashMode = viewParam === "trash";

  const isCreateMode = actionParam === "create";
  const isEditMode = actionParam === "edit" && Boolean(editId);

  // Separate active projects and soft-deleted projects
  const activeProjects = useMemo(() => data.filter((p) => !p.deleted_at), [data]);
  const trashProjects = useMemo(() => {
    return data
      .filter((p) => Boolean(p.deleted_at))
      .sort((a, b) => {
        const timeA = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
        const timeB = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
        return timeB - timeA;
      });
  }, [data]);

  const editingProject = useMemo(() => {
    if (!isEditMode || !editId) return null;
    return (
      activeProjects.find(
        (p) =>
          String(p.project_id_pm) === editId ||
          String(p.id) === editId ||
          String(p.nomor) === editId
      ) || null
    );
  }, [activeProjects, isEditMode, editId]);

  const isFormOpen = isCreateMode || (isEditMode && Boolean(editingProject));

  // Reset URL if invalid edit id is provided and data has finished loading
  useEffect(() => {
    if (!isLoading && isEditMode && !editingProject && activeProjects.length > 0) {
      console.warn(`Project with id "${editId}" not found in repository`);
      setSearchParams({});
    }
  }, [isLoading, isEditMode, editingProject, activeProjects.length, editId, setSearchParams]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const { data: projects, error } = await supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching projects:", error);
          return;
        }

        if (projects) {
          syncHighWaterMarks(projects as ProjectPM[]);
          const sortedProjects = [...projects].sort(compareProjectsBySeq);
          setData(sortedProjects as ProjectPM[]);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjects();
  }, []);

  const handleAddClick = () => {
    setSearchParams({ action: "create" });
  };

  const handleEditClick = (project: ProjectPM) => {
    setSearchParams({ action: "edit", id: String(project.project_id_pm || project.id) });
  };

  const handleTrashClick = () => {
    if (isTrashMode) {
      handleBackFromTrash();
    } else {
      setSearchParams({ view: "trash" });
    }
  };

  const handleBackFromTrash = () => {
    setSearchParams({});
    if (lastRestoredIdRef.current) {
      triggerRowHighlight(lastRestoredIdRef.current, "sky");
      lastRestoredIdRef.current = null;
    }
  };

  const handleDeleteClick = (project: ProjectPM) => {
    setProjectToDelete(project);
  };

  const handleCancelDelete = () => {
    if (!isDeleting) {
      setProjectToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);

    try {
      const targetId = projectToDelete.id;
      const targetNomor = projectToDelete.nomor;
      const targetProjectIdPm = projectToDelete.project_id_pm;

      if (isTrashMode) {
        // Permanent delete from Supabase
        let query = supabase.from("projects").delete();
        if (targetId) {
          query = query.eq("id", targetId);
        } else if (targetNomor) {
          query = query.eq("nomor", targetNomor);
        } else {
          query = query.eq("project_id_pm", targetProjectIdPm);
        }

        const { error } = await query;

        if (error) {
          console.error("Failed to permanently delete project:", error);
          showToast({
            type: "error",
            title: "Failed to Delete Project",
            description: error.message || "Failed to permanently delete project from database.",
            duration: 5000,
          });
          return;
        }

        setData((prev) =>
          prev.filter((p) => {
            if (targetId && p.id === targetId) return false;
            if (targetNomor && p.nomor === targetNomor) return false;
            return p.project_id_pm !== targetProjectIdPm;
          })
        );

        showToast({
          type: "success",
          title: "Project Permanently Deleted",
          description: `${targetProjectIdPm} has been permanently deleted from database.`,
          duration: 5000,
        });
      } else {
        // Soft delete: stamp deleted_at timestamp
        const deletedAt = new Date().toISOString();
        let query = supabase
          .from("projects")
          .update({ deleted_at: deletedAt });

        if (targetId) {
          query = query.eq("id", targetId);
        } else if (targetNomor) {
          query = query.eq("nomor", targetNomor);
        } else {
          query = query.eq("project_id_pm", targetProjectIdPm);
        }

        const { error } = await query;

        if (error) {
          console.error("Failed to soft-delete project:", error);
          showToast({
            type: "error",
            title: "Failed to Delete Project",
            description: error.message || "Failed to move project to Trash.",
            duration: 5000,
          });
          return;
        }

        setData((prev) =>
          prev.map((p) => {
            const isMatch =
              (targetId && p.id === targetId) ||
              (targetNomor && p.nomor === targetNomor) ||
              p.project_id_pm === targetProjectIdPm;
            return isMatch ? { ...p, deleted_at: deletedAt } : p;
          })
        );

        showToast({
          type: "success",
          title: "Project Successfully Deleted",
          description: `${targetProjectIdPm} moved to Trash. You can restore it anytime.`,
          duration: 5000,
        });
      }

      if (highlightedRowId === projectToDelete.project_id_pm) {
        setHighlightedRowId(null);
      }

      setProjectToDelete(null);
    } catch (err: unknown) {
      console.error("Unexpected error deleting project:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast({
        type: "error",
        title: "Unexpected Error",
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRestoreClick = (project: ProjectPM) => {
    setProjectToRestore(project);
  };

  const handleCancelRestore = () => {
    if (!isRestoring) {
      setProjectToRestore(null);
    }
  };

  const handleConfirmRestore = async () => {
    if (!projectToRestore) return;
    setIsRestoring(true);

    try {
      const targetId = projectToRestore.id;
      const targetNomor = projectToRestore.nomor;
      const targetProjectIdPm = projectToRestore.project_id_pm;

      let query = supabase
        .from("projects")
        .update({ deleted_at: null });

      if (targetId) {
        query = query.eq("id", targetId);
      } else if (targetNomor) {
        query = query.eq("nomor", targetNomor);
      } else {
        query = query.eq("project_id_pm", targetProjectIdPm);
      }

      const { error } = await query;

      if (error) {
        console.error("Failed to restore project:", error);
        showToast({
          type: "error",
          title: "Failed to Restore Project",
          description: error.message || "Failed to restore project from Trash.",
          duration: 5000,
        });
        return;
      }

      // Update local state: reset deleted_at and preserve sorting
      setData((prev) => {
        const next = prev.map((p) => {
          const isMatch =
            (targetId && p.id === targetId) ||
            (targetNomor && p.nomor === targetNomor) ||
            p.project_id_pm === targetProjectIdPm;
          return isMatch ? { ...p, deleted_at: null } : p;
        });
        return next.sort(compareProjectsBySeq);
      });

      // Track last restored project ID for highlight & scroll upon returning to active repository
      lastRestoredIdRef.current = targetProjectIdPm;

      showToast({
        type: "success",
        title: "Project Successfully Restored",
        description: `${targetProjectIdPm} successfully restored to active repository.`,
        duration: 5000,
      });

      setProjectToRestore(null);
    } catch (err: unknown) {
      console.error("Unexpected error restoring project:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      showToast({
        type: "error",
        title: "Unexpected Error",
        description: errorMsg,
        duration: 5000,
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleBackClick = () => {
    if (projectFormRef.current) {
      projectFormRef.current.attemptCancel();
    } else {
      if (isEditMode && editingProject) {
        triggerRowHighlight(editingProject.project_id_pm, "grey");
      }
      setSearchParams({});
    }
  };

  const handleFormCancel = () => {
    if (isEditMode && editingProject) {
      triggerRowHighlight(editingProject.project_id_pm, "grey");
    }
    setSearchParams({});
  };

  const handleFormSuccess = (savedProject: Partial<ProjectPM> & { project_id_pm: string }) => {
    setData((prev) => {
      const matchIndex = prev.findIndex(
        (p) =>
          (savedProject.id && p.id === savedProject.id) ||
          (savedProject.nomor && p.nomor === savedProject.nomor) ||
          (editId && p.project_id_pm === editId) ||
          p.project_id_pm === savedProject.project_id_pm
      );

      let nextData: ProjectPM[];
      if (matchIndex >= 0) {
        nextData = [...prev];
        nextData[matchIndex] = { ...nextData[matchIndex], ...savedProject };
      } else {
        nextData = [...prev, savedProject];
      }

      return nextData.sort(compareProjectsBySeq);
    });

    triggerRowHighlight(savedProject.project_id_pm, "sky");
    setSearchParams({});
  };

  const handleExportExcel = async (
    displayedRows?: ProjectPM[],
    visibleColumns?: Array<{ key: string; header: string }>
  ) => {
    const rowsToExport = displayedRows || (isTrashMode ? trashProjects : activeProjects);
    if (rowsToExport.length === 0) {
      showToast({
        type: "error",
        title: "Export Gagal",
        description: "Tidak ada data proyek yang ditampilkan untuk diekspor.",
      });
      return;
    }
    try {
      const { exportProjectsToExcel } = await import("@/lib/exportUtils");
      await exportProjectsToExcel(rowsToExport, {
        columns: visibleColumns,
        isTrashView: isTrashMode,
      });
      showToast({
        type: "success",
        title: "Export Berhasil",
        description: "File Excel (.xlsx) berhasil diunduh.",
      });
    } catch (err: unknown) {
      console.error("Failed to export Excel file:", err);
      showToast({
        type: "error",
        title: "Export Gagal",
        description: "Terjadi kesalahan saat memproses file Excel.",
      });
    }
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 h-full overflow-hidden">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-telkom-navy tracking-tight">Master Repository</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 md:mt-1">
          {isTrashMode ? "Trash / Deleted Projects" : "New Populasi Project"}
        </p>
      </div>

      {/* Main Table / Form Container */}
      <div className="flex-1 min-h-0 flex flex-col">
        <DataTable 
          columns={columns} 
          data={isTrashMode ? trashProjects : activeProjects} 
          isLoading={isLoading}
          isFormMode={isFormOpen}
          isTrashMode={isTrashMode}
          highlightedRowId={highlightedRowId}
          highlightVariant={highlightVariant}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          onRestore={handleRestoreClick}
          onPermanentDelete={handleDeleteClick}
          onTrashClick={handleTrashClick}
          onExportExcel={handleExportExcel}
          createFormSlot={
            <ProjectForm
              ref={projectFormRef}
              mode={isEditMode ? "edit" : "create"}
              initialData={editingProject}
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
              existingProjects={data}
            />
          }
          actionSlot={
            isFormOpen ? (
              <Button
                data-testid="btn-back"
                size="lg"
                variant="outline"
                onClick={handleBackClick}
                className="w-full md:w-[120px] bg-white border border-slate-300/80 text-slate-700 hover:bg-slate-50 hover:border-telkom-navy hover:text-telkom-navy active:bg-slate-100 rounded-md shadow-none transition-all h-10 min-h-10 max-h-10 shrink-0 px-2 cursor-pointer text-xs sm:text-sm font-medium flex items-center justify-center gap-2 sm:gap-2.5"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] select-none leading-none">
                  arrow_back
                </span>
                <span className="whitespace-nowrap">Back</span>
              </Button>
            ) : isTrashMode ? (
              <Button
                data-testid="btn-back-trash"
                size="lg"
                variant="outline"
                onClick={handleBackFromTrash}
                className="w-full md:w-[120px] bg-white border border-slate-300/80 text-slate-700 hover:bg-slate-50 hover:border-telkom-navy hover:text-telkom-navy active:bg-slate-100 rounded-md shadow-none transition-all h-10 min-h-10 max-h-10 shrink-0 px-2 cursor-pointer text-xs sm:text-sm font-medium flex items-center justify-center gap-2 sm:gap-2.5"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] select-none leading-none">
                  arrow_back
                </span>
                <span className="whitespace-nowrap">Back</span>
              </Button>
            ) : (
              <Button
                data-testid="btn-add-project"
                size="lg"
                onClick={handleAddClick}
                className="w-full md:w-[120px] bg-telkom-navy text-white hover:bg-[#003d82] active:bg-[#002047] border border-transparent rounded-md shadow-none transition-all h-10 min-h-10 max-h-10 shrink-0 px-1.5 sm:px-2 cursor-pointer text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] select-none leading-none">
                  add
                </span>
                <span className="whitespace-nowrap">Add Project</span>
              </Button>
            )
          }
        />
      </div>

      {/* Delete Confirmation Modal (Soft delete in repository, permanent delete in trash) */}
      <DeleteConfirmationModal
        isOpen={Boolean(projectToDelete)}
        project={projectToDelete}
        isDeleting={isDeleting}
        isPermanent={isTrashMode}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      {/* Restore Confirmation Modal */}
      <RestoreConfirmationModal
        isOpen={Boolean(projectToRestore)}
        project={projectToRestore}
        isRestoring={isRestoring}
        onCancel={handleCancelRestore}
        onConfirm={handleConfirmRestore}
      />
    </div>
  );
}