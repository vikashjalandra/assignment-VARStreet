import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProjectById, getProjectTasks } from "../api/projects.api";
import { deleteTask } from "../api/tasks.api";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ErrorAlert from "../components/ui/ErrorAlert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PriorityBadge from "../components/ui/PriorityBadge";
import StatusBadge from "../components/ui/StatusBadge";
import {
  PRIORITY_VALUES,
  SORT_BY_LABELS,
  SORT_BY_VALUES,
  SORT_DIR_LABELS,
  SORT_DIR_VALUES,
  STATUS_VALUES,
} from "../constants";
import { useAppContext } from "../context/AppContext";
import useApi from "../hooks/useApi";
import { formatDate, isOverdueTask } from "../utils/date";

const defaultTaskListResponse = {
  data: [],
  page: 1,
  pageSize: 10,
  totalCount: 0,
  totalPages: 0,
};

const TaskBoardPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { setSelectedProject, pushNotification } = useAppContext();

  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const {
    data: project,
    loading: loadingProject,
    error: projectError,
    execute: loadProject,
  } = useApi(null);

  const {
    data: taskResponse,
    loading: loadingTasks,
    error: tasksError,
    execute: loadTasks,
  } = useApi(defaultTaskListResponse);

  const {
    loading: deletingTask,
    error: deleteError,
    execute: runDeleteTask,
  } = useApi(null);

  useEffect(() => {
    loadProject(() => getProjectById(projectId));
  }, [projectId, loadProject]);

  useEffect(() => {
    if (!project) {
      return;
    }

    setSelectedProject({ id: project.id, name: project.name });
  }, [project, setSelectedProject]);

  const fetchTasks = useCallback(() => {
    return loadTasks(() =>
      getProjectTasks(projectId, {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        sortBy,
        sortDir,
        page,
        pageSize,
      })
    );
  }, [loadTasks, page, pageSize, priorityFilter, projectId, sortBy, sortDir, statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const resetFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setSortBy("createdAt");
    setSortDir("desc");
    setPage(1);
    setPageSize(10);
  };

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const handleConfirmDelete = async () => {
    if (!taskToDelete) {
      return;
    }

    const result = await runDeleteTask(() => deleteTask(taskToDelete.id));
    if (result.ok) {
      pushNotification("success", `Deleted task "${taskToDelete.title}"`);
      setTaskToDelete(null);
      fetchTasks();
    }
  };

  const tasks = taskResponse?.data || [];
  const totalPages = taskResponse?.totalPages || 0;

  return (
    <section className="space-y-6 page-enter">
      <div className="space-y-2">
        <p className="label-soft">Task Board</p>
        <h1 className="font-display text-4xl text-slate-900">{project?.name || "Project Board"}</h1>
        <p className="text-sm text-slate-600">
          Filter, sort, and page through project tasks with due-date awareness.
        </p>
      </div>

      {projectError ? <ErrorAlert message={projectError} /> : null}
      {tasksError ? <ErrorAlert message={tasksError} /> : null}
      {deleteError ? <ErrorAlert message={deleteError} /> : null}

      <div className="card-glass space-y-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="text-sm font-medium text-slate-700">
            Status
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {STATUS_VALUES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Priority
            <select
              value={priorityFilter}
              onChange={handleFilterChange(setPriorityFilter)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">All</option>
              {PRIORITY_VALUES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Sort By
            <select
              value={sortBy}
              onChange={handleFilterChange(setSortBy)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {SORT_BY_VALUES.map((value) => (
                <option key={value} value={value}>
                  {SORT_BY_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Direction
            <select
              value={sortDir}
              onChange={handleFilterChange(setSortDir)}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {SORT_DIR_VALUES.map((value) => (
                <option key={value} value={value}>
                  {SORT_DIR_LABELS[value]}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-medium text-slate-700">
            Page Size
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/projects/${projectId}/tasks/new`}
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add Task
          </Link>
          <Link
            to={`/projects/${projectId}/edit`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Edit Project
          </Link>
          <span className="ml-auto text-xs font-bold uppercase tracking-wide text-slate-500">
            {taskResponse.totalCount} tasks found
          </span>
        </div>
      </div>

      {loadingProject || loadingTasks ? (
        <LoadingSpinner label="Loading task board" />
      ) : tasks.length === 0 ? (
        <div className="card-glass text-sm text-slate-600">
          No tasks match the current filters.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, index) => {
            const overdue = isOverdueTask(task);

            return (
              <article
                key={task.id}
                className={`task-tile cursor-pointer ${
                  overdue ? "border-black bg-slate-100" : ""
                }`}
                style={{ animationDelay: `${index * 60}ms` }}
                onClick={() => navigate(`/tasks/${task.id}`)}
              >
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-900">{task.title}</p>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>

                  <p className={`text-sm ${overdue ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                    Due: {formatDate(task.dueDate)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      navigate(`/tasks/${task.id}`);
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 transition hover:border-slate-500"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setTaskToDelete(task);
                    }}
                    className="rounded-lg border border-slate-500 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:border-slate-700 hover:bg-slate-100"
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1 || loadingTasks}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-slate-600">
          Page {taskResponse.page} of {totalPages || 1}
        </span>
        <button
          type="button"
          onClick={() => setPage((current) => (totalPages ? Math.min(totalPages, current + 1) : current + 1))}
          disabled={totalPages === 0 || page >= totalPages || loadingTasks}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <ConfirmDialog
        open={Boolean(taskToDelete)}
        title="Delete task"
        message={`Delete ${taskToDelete?.title || "this task"}? This action cannot be undone.`}
        confirmLabel="Delete task"
        busy={deletingTask}
        onCancel={() => setTaskToDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </section>
  );
};

export default TaskBoardPage;
