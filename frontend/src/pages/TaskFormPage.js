import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createTaskForProject } from "../api/projects.api";
import { getTaskById, updateTask } from "../api/tasks.api";
import ErrorAlert from "../components/ui/ErrorAlert";
import FieldError from "../components/ui/FieldError";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { PRIORITY_VALUES, STATUS_VALUES } from "../constants";
import { useAppContext } from "../context/AppContext";
import useApi from "../hooks/useApi";
import { toDateInputValue } from "../utils/date";

const defaultFormState = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Todo",
  dueDate: "",
};

const TaskFormPage = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { pushNotification, setSelectedProject } = useAppContext();
  const isEditMode = Boolean(taskId);

  const [formState, setFormState] = useState(defaultFormState);
  const [resolvedProjectId, setResolvedProjectId] = useState(projectId || "");

  const {
    data: existingTask,
    loading: loadingTask,
    error: loadError,
    execute: loadTask,
  } = useApi(null);

  const {
    loading: saveLoading,
    error: saveError,
    fieldErrors,
    execute: runSave,
  } = useApi(null);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    loadTask(() => getTaskById(taskId));
  }, [isEditMode, loadTask, taskId]);

  useEffect(() => {
    if (!existingTask) {
      return;
    }

    setResolvedProjectId(String(existingTask.projectId));
    setFormState({
      title: existingTask.title || "",
      description: existingTask.description || "",
      priority: existingTask.priority || "Medium",
      status: existingTask.status || "Todo",
      dueDate: toDateInputValue(existingTask.dueDate),
    });

    setSelectedProject({
      id: existingTask.projectId,
      name: `Project ${existingTask.projectId}`,
    });
  }, [existingTask, setSelectedProject]);

  useEffect(() => {
    if (!projectId) {
      return;
    }

    setSelectedProject({ id: Number(projectId), name: `Project ${projectId}` });
  }, [projectId, setSelectedProject]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: formState.title,
      description: formState.description,
      priority: formState.priority,
      status: formState.status,
      dueDate: formState.dueDate ? new Date(`${formState.dueDate}T00:00:00.000Z`).toISOString() : null,
    };

    const result = await runSave(() => {
      if (isEditMode) {
        return updateTask(taskId, payload);
      }

      return createTaskForProject(resolvedProjectId, payload);
    });

    if (!result.ok) {
      return;
    }

    pushNotification("success", isEditMode ? "Task updated" : "Task created");

    if (isEditMode) {
      navigate(`/tasks/${taskId}`);
      return;
    }

    navigate(`/projects/${resolvedProjectId}/board`);
  };

  if (isEditMode && loadingTask) {
    return <LoadingSpinner label="Loading task" />;
  }

  const backTarget = resolvedProjectId ? `/projects/${resolvedProjectId}/board` : "/projects";

  return (
    <section className="mx-auto w-full max-w-3xl space-y-5 page-enter">
      <div>
        <p className="label-soft">{isEditMode ? "Edit Task" : "Create Task"}</p>
        <h1 className="mt-1 font-display text-4xl text-slate-900">
          {isEditMode ? "Adjust Task Plan" : "Add A New Task"}
        </h1>
      </div>

      {loadError ? <ErrorAlert message={loadError} /> : null}
      {saveError ? <ErrorAlert message={saveError} /> : null}

      <form onSubmit={handleSubmit} className="card-glass space-y-4">
        <div>
          <label htmlFor="title" className="text-sm font-semibold text-slate-800">
            Title
          </label>
          <input
            id="title"
            name="title"
            value={formState.title}
            onChange={handleInputChange}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <FieldError message={fieldErrors.title} />
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
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          />
          <FieldError message={fieldErrors.description} />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-sm font-semibold text-slate-800">
            Priority
            <select
              name="priority"
              value={formState.priority}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {PRIORITY_VALUES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.priority} />
          </label>

          <label className="text-sm font-semibold text-slate-800">
            Status
            <select
              name="status"
              value={formState.status}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.status} />
          </label>

          <label className="text-sm font-semibold text-slate-800">
            Due Date
            <input
              type="date"
              name="dueDate"
              value={formState.dueDate}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <FieldError message={fieldErrors.dueDate} />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to={backTarget}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saveLoading}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saveLoading ? "Saving..." : isEditMode ? "Update Task" : "Create Task"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default TaskFormPage;
