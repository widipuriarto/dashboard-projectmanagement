import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { DataTable } from "@/components/organisms/DataTable";
import { columns, type ProjectPM } from "@/components/organisms/columns";
import { ProjectForm, type ProjectFormHandle } from "@/components/organisms/ProjectForm";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export default function Repository() {
  const [data, setData] = useState<ProjectPM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedRowId, setHighlightedRowId] = useState<string | null>(null);
  const projectFormRef = useRef<ProjectFormHandle>(null);

  const isCreateMode = searchParams.get("action") === "create";

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
          // Sort by sequential number at the trailing edge of project_id_pm
          const sortedProjects = projects.sort((a, b) => {
            const getNum = (id: string) => {
              if (!id) return 0;
              const match = String(id).match(/(\d+)$/);
              return match ? parseInt(match[0], 10) : 0;
            };
            const numA = getNum(a.project_id_pm);
            const numB = getNum(b.project_id_pm);
            if (numA !== numB) {
              return numA - numB;
            }
            return (a.nomor || 0) - (b.nomor || 0);
          });
          
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

  const handleFormSuccess = (newProject: any) => {
    setData((prev) => {
      const updated = [...prev, newProject];
      return updated.sort((a, b) => {
        const getNum = (id: string) => {
          if (!id) return 0;
          const match = String(id).match(/(\d+)$/);
          return match ? parseInt(match[0], 10) : 0;
        };
        const numA = getNum(a.project_id_pm);
        const numB = getNum(b.project_id_pm);
        if (numA !== numB) {
          return numA - numB;
        }
        return (a.nomor || 0) - (b.nomor || 0);
      });
    });
    setHighlightedRowId(newProject.project_id_pm);
    setSearchParams({});

    // Auto-remove highlight after 3.5 seconds
    setTimeout(() => {
      setHighlightedRowId(null);
    }, 3500);
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
          isCreateMode={isCreateMode}
          highlightedRowId={highlightedRowId}
          createFormSlot={
            <ProjectForm
              ref={projectFormRef}
              onCancel={handleFormCancel}
              onSuccess={handleFormSuccess}
              existingProjects={data}
            />
          }
          actionSlot={
            isCreateMode ? (
              <Button
                size="lg"
                variant="outline"
                onClick={handleBackClick}
                className="w-full md:w-auto bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100 rounded-lg shadow-sm hover:shadow transition-all h-10 px-2 sm:px-4 cursor-pointer text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
              >
                <span className="material-symbols-outlined text-[18px] sm:text-[20px] select-none leading-none">
                  arrow_back
                </span>
                <span className="truncate">Back</span>
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={handleAddClick}
                className="w-full md:w-auto bg-telkom-navy text-white hover:bg-[#003d82] active:bg-[#002047] rounded-lg shadow-sm hover:shadow-md transition-all h-10 px-2 sm:px-4 cursor-pointer text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2"
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
    </div>
  );
}