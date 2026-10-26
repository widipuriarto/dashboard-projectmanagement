import { useEffect, useState, useRef, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "@/components/organisms/DataTable";
import {
  columns,
  STORAGE_KEY_HIGHEST_SEQ,
  STORAGE_KEY_HIGHEST_NOMOR,
  type ProjectPM,
} from "@/components/organisms/columns";
import { ProjectForm, type ProjectFormHandle } from "@/components/organisms/ProjectForm";
import { DeleteConfirmationModal } from "@/components/molecules/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/context/ToastContext";

function extractProjectSeqNumber(id?: string | null): number {
  if (!id) return 0;
  const match = String(id).match(/(\d+)$/);
  return match ? parseInt(match[0], 10) : 0;
}

export function compareProjectsBySeq(a: ProjectPM, b: ProjectPM): number {
  const numA = extractProjectSeqNumber(a.project_id_pm);
  const numB = extractProjectSeqNumber(b.project_id_pm);
  if (numA !== numB) {
    return numA - numB;
  }
  return (a.nomor || 0) - (b.nomor || 0);
}

export default function Repository() {
  const [data, setData] = useState<ProjectPM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<ProjectPM | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const projectFormRef = useRef<ProjectFormHandle>(null);
  const { showToast } = useToast();

  const actionParam = searchParams.get("action");
  const editId = searchParams.get("id");
  const isCreateMode = actionParam === "create";
  const isEditMode = actionParam === "edit" && Boolean(editId);

  const editingProject = useMemo(() => {
    if (!isEditMode || !editId) return null;
    return (
      data.find(
        (p) =>
          String(p.project_id_pm) === editId ||
          String(p.id) === editId ||
          String(p.nomor) === editId
      ) || null
    );
  }, [data, isEditMode, editId]);

  const isFormOpen = isCreateMode || (isEditMode && Boolean(editingProject));

  // Reset URL if invalid edit id is provided and data has finished loading
  useEffect(() => {
    if (!isLoading && isEditMode && !editingProject && data.length > 0) {
      console.warn(`Project with id "${editId}" not found in repository`);
      setSearchParams({});
    }
  }, [isLoading, isEditMode, editingProject, data.length, editId, setSearchParams]);

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
          // Initialize highest high-water mark for sequence and nomor in localStorage
          let maxSeq = 0;
          let maxNomor = 0;
          projects.forEach((p) => {
            const match = String(p.project_id_pm || "").match(/(\d+)$/);
            if (match) {
              const n = parseInt(match[1], 10);
              if (!isNaN(n) && n > maxSeq) maxSeq = n;
            }
            const nm = typeof p.nomor === "number" ? p.nomor : parseInt(String(p.nomor), 10);
            if (!isNaN(nm) && nm > maxNomor) maxNomor = nm;
          });

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
            console.error("Failed to sync highest sequence to localStorage", e);
          }

          // Sort by sequential number at the trailing edge of project_id_pm
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
      let query = supabase.from("projects").delete();
      if (projectToDelete.id) {
        query = query.eq("id", projectToDelete.id);
      } else if (projectToDelete.nomor) {
        query = query.eq("nomor", projectToDelete.nomor);
      } else {
        query = query.eq("project_id_pm", projectToDelete.project_id_pm);
      }

      const { error } = await query;

      if (error) {
        console.error("Failed to delete project:", error);
        showToast({
          type: "error",
          title: "Failed to Delete Project",
          description: error.message || "Failed to delete project from database.",
          duration: 5000,
        });
        return;
      }

      const deletedName = projectToDelete.nama_proyek || projectToDelete.project_id_pm;

      setData((prev) =>
        prev.filter((p) => {
          if (projectToDelete.id && p.id === projectToDelete.id) return false;
          if (projectToDelete.nomor && p.nomor === projectToDelete.nomor) return false;
          return p.project_id_pm !== projectToDelete.project_id_pm;
        })
      );

      if (highlightedRowId === projectToDelete.project_id_pm) {
        setHighlightedRowId(null);
      }

      showToast({
        type: "success",
        title: "Project Successfully Deleted",
        description: `${deletedName} successfully deleted.`,
        duration: 5000,
      });

      setProjectToDelete(null);
    } catch (err: any) {
      console.error("Unexpected error deleting project:", err);
      showToast({
        type: "error",
        title: "Unexpected Error",
        description: err.message || String(err),
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackClick = () => {
    if (projectFormRef.current) {
      projectFormRef.current.attemptCancel();
    } else {
      setSearchParams({});
    }
  };

  const handleFormCancel = () => {
    setSearchParams({});
  };

  const handleFormSuccess = (savedProject: any) => {
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

    setHighlightedRowId(savedProject.project_id_pm);
    setSearchParams({});

    // Auto-remove highlight after 5 seconds
    setTimeout(() => {
      setHighlightedRowId(null);
    }, 5000);
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 h-full overflow-hidden">
      {/* Page Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-telkom-navy tracking-tight">Master Repository</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5 md:mt-1">
          New Populasi Project
        </p>
      </div>

      {/* Main Table / Form Container */}
      <div className="flex-1 min-h-0 flex flex-col">
        <DataTable 
          columns={columns} 
          data={data} 
          isLoading={isLoading}
          isFormMode={isFormOpen}
          highlightedRowId={highlightedRowId}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
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
                className="w-full md:w-auto bg-white border border-transparent text-slate-700 hover:bg-slate-50 hover:border-telkom-navy hover:text-telkom-navy active:bg-slate-100 rounded-md shadow-sm hover:shadow transition-all h-10 px-2 sm:px-4 cursor-pointer text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] select-none leading-none">
                  arrow_back
                </span>
                <span className="truncate">Back</span>
              </Button>
            ) : (
              <Button
                data-testid="btn-add-project"
                size="lg"
                onClick={handleAddClick}
                className="w-full md:w-auto bg-telkom-navy text-white hover:bg-[#003d82] active:bg-[#002047] rounded-md shadow-sm hover:shadow-md transition-all h-10 px-2 sm:px-4 cursor-pointer text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] select-none leading-none">
                  add
                </span>
                <span className="truncate">Add Project</span>
              </Button>
            )
          }
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={Boolean(projectToDelete)}
        project={projectToDelete}
        isDeleting={isDeleting}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}