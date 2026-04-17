import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createProject,
  getProjectById,
  updateProject,
} from "../api/projects.api";
import ErrorAlert from "../components/ui/ErrorAlert";
import FieldError from "../components/ui/FieldError";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { useAppContext } from "../context/AppContext";
import useApi from "../hooks/useApi";

const defaultFormState = {
  name: "",
  description: "",
};

const ProjectFormPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { pushNotification, setSelectedProject } = useAppContext();
  const isEditMode = Boolean(projectId);

  const [formState, setFormState] = useState(defaultFormState);

  const {
    data: project,
    loading: loadingProject,
    error: loadError,
    execute: loadProject,
  } = useApi(null);

  const {
    loading: saveLoading,
    error: saveError,
    fieldErrors,
    execute: saveProject,
  } = useApi(null);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    loadProject(() => getProjectById(projectId));
  }, [isEditMode, projectId, loadProject]);

  useEffect(() => {
    if (!project) {
      return;
    }

    setFormState({
      name: project.name || "",
      description: project.description || "",
    });
  }, [project]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      name: formState.name,
      description: formState.description,
    };

    const result = await saveProject(() => {
      if (isEditMode) {
        return updateProject(projectId, payload);
      }

      return createProject(payload);
    });

    if (!result.ok) {
      return;
    }

    const savedProject = result.data;
    setSelectedProject({ id: savedProject.id, name: savedProject.name });

    pushNotification(
      "success",
      isEditMode ? "Project updated successfully" : "Project created successfully"
    );

    navigate(`/projects/${savedProject.id}/board`);
  };

  if (isEditMode && loadingProject) {
    return <LoadingSpinner label="Loading project" />;
  }

  return (
    <section className="mx-auto w-full max-w-2xl space-y-5 page-enter">
      <div className="space-y-2">
        <p className="label-soft">{isEditMode ? "Edit Project" : "Create Project"}</p>
        <h1 className="font-display text-4xl text-slate-900">
          {isEditMode ? "Refine Project Details" : "Start A New Project"}
        </h1>
      </div>

      {loadError ? <ErrorAlert message={loadError} /> : null}
      {saveError ? <ErrorAlert message={saveError} /> : null}

      <form
        onSubmit={handleSubmit}
        className="card-glass space-y-4"
      >
        <div>
          <label htmlFor="name" className="text-sm font-semibold text-slate-800">
            Project Name
          </label>
          <input
            id="name"
            name="name"
            value={formState.name}
            onChange={handleInputChange}
            placeholder="E.g. Release Coordination"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-black focus:ring-2 focus:ring-slate-300"
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-semibold text-slate-800">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={formState.description}
            onChange={handleInputChange}
            placeholder="Briefly describe what this project delivers"
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-black focus:ring-2 focus:ring-slate-300"
          />
          <FieldError message={fieldErrors.description} />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/projects"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 hover:text-slate-900"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveLoading}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saveLoading ? "Saving..." : isEditMode ? "Update Project" : "Create Project"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProjectFormPage;
