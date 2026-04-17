import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { deleteProject, getProjects } from "../api/projects.api";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ErrorAlert from "../components/ui/ErrorAlert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAppContext } from "../context/AppContext";
import useApi from "../hooks/useApi";

const buildStatusSummary = (statusMap = {}) => {
  const todo = statusMap.Todo || 0;
  const inProgress = statusMap.InProgress || 0;
  const review = statusMap.Review || 0;
  const done = statusMap.Done || 0;

  return `${todo} Todo \u00B7 ${inProgress} In Progress \u00B7 ${review} Review \u00B7 ${done} Done`;
};

const ProjectsPage = () => {
  const navigate = useNavigate();
  const { setSelectedProject, pushNotification } = useAppContext();
  const {
    data: projects,
    loading,
    error,
    execute: loadProjects,
  } = useApi([]);

  const {
    loading: deleteLoading,
    error: deleteError,
    execute: runDelete,
  } = useApi(null);

  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    loadProjects(() => getProjects());
  }, [loadProjects]);

  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [projects]);

  const handleOpenBoard = (project) => {
    setSelectedProject({ id: project.id, name: project.name });
    navigate(`/projects/${project.id}/board`);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) {
      return;
    }

    const result = await runDelete(() => deleteProject(projectToDelete.id));
    if (result.ok) {
      pushNotification("success", `Deleted project "${projectToDelete.name}"`);
      setProjectToDelete(null);
      loadProjects(() => getProjects());
    }
  };

  return (
    <section className="space-y-6 page-enter">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="label-soft">Projects</p>
          <h1 className="mt-1 font-display text-4xl text-slate-900">Project Catalog</h1>
          <p className="mt-2 text-sm text-slate-600">Select a project to inspect, plan, and execute tasks.</p>
        </div>

        <Link
          to="/projects/new"
          className="inline-flex items-center justify-center rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800"
        >
          New Project
        </Link>
      </div>

      {error ? <ErrorAlert message={error} /> : null}
      {deleteError ? <ErrorAlert message={deleteError} /> : null}

      {loading ? (
        <LoadingSpinner label="Loading projects" />
      ) : orderedProjects.length === 0 ? (
        <div className="card-glass text-sm text-slate-600">No projects yet. Create your first project.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedProjects.map((project, index) => (
            <article
              key={project.id}
              className="card-glass flex flex-col justify-between gap-4"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="space-y-2">
                <h2 className="font-display text-2xl text-slate-900">{project.name}</h2>
                <p className="min-h-[48px] text-sm text-slate-600">
                  {project.description || "No description provided."}
                </p>
                <p className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700">
                  {buildStatusSummary(project.taskCountByStatus)}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenBoard(project)}
                  className="inline-flex flex-1 items-center justify-center rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700"
                >
                  Open Board
                </button>
                <Link
                  to={`/projects/${project.id}/edit`}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setProjectToDelete(project)}
                  className="inline-flex items-center justify-center rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:border-slate-700 hover:bg-slate-100"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(projectToDelete)}
        title="Delete project"
        message={`This will remove ${projectToDelete?.name || "this project"} and all related tasks/comments.`}
        confirmLabel="Delete project"
        busy={deleteLoading}
        onCancel={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
};

export default ProjectsPage;
