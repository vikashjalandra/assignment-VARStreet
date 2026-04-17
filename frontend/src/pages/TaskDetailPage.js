import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createTaskComment, deleteComment } from "../api/comments.api";
import { deleteTask, getTaskById, updateTask } from "../api/tasks.api";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import ErrorAlert from "../components/ui/ErrorAlert";
import FieldError from "../components/ui/FieldError";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import PriorityBadge from "../components/ui/PriorityBadge";
import StatusBadge from "../components/ui/StatusBadge";
import { PRIORITY_VALUES, STATUS_VALUES } from "../constants";
import { useAppContext } from "../context/AppContext";
import useApi from "../hooks/useApi";
import { formatDate, isOverdueTask, toDateInputValue } from "../utils/date";

const initialTaskForm = {
  title: "",
  description: "",
  priority: "Medium",
  status: "Todo",
  dueDate: "",
};

const initialCommentForm = {
  author: "",
  body: "",
};

const TaskDetailPage = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const { pushNotification, setSelectedProject } = useAppContext();

  const {
    data: task,
    loading: loadingTask,
    error: taskError,
    execute: loadTask,
  } = useApi(null);

  const {
    loading: updateLoading,
    error: updateError,
    fieldErrors: updateFieldErrors,
    execute: runTaskUpdate,
  } = useApi(null);

  const {
    loading: addCommentLoading,
    error: addCommentError,
    fieldErrors: addCommentFieldErrors,
    execute: runAddComment,
  } = useApi(null);

  const {
    loading: deleteCommentLoading,
    error: deleteCommentError,
    execute: runDeleteComment,
  } = useApi(null);

  const {
    loading: deleteTaskLoading,
    error: deleteTaskError,
    execute: runDeleteTask,
  } = useApi(null);

  const [taskForm, setTaskForm] = useState(initialTaskForm);
  const [commentForm, setCommentForm] = useState(initialCommentForm);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [showTaskDeleteDialog, setShowTaskDeleteDialog] = useState(false);

  const refreshTask = useCallback(() => {
    return loadTask(() => getTaskById(taskId));
  }, [loadTask, taskId]);

  useEffect(() => {
    refreshTask();
  }, [refreshTask]);

  useEffect(() => {
    if (!task) {
      return;
    }

    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "Medium",
      status: task.status || "Todo",
      dueDate: toDateInputValue(task.dueDate),
    });

    setSelectedProject({
      id: task.projectId,
      name: `Project ${task.projectId}`,
    });
  }, [task, setSelectedProject]);

  const handleTaskFieldChange = (event) => {
    const { name, value } = event.target;
    setTaskForm((current) => ({ ...current, [name]: value }));
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      title: taskForm.title,
      description: taskForm.description,
      priority: taskForm.priority,
      status: taskForm.status,
      dueDate: taskForm.dueDate
        ? new Date(`${taskForm.dueDate}T00:00:00.000Z`).toISOString()
        : null,
    };

    const result = await runTaskUpdate(() => updateTask(taskId, payload));
    if (result.ok) {
      pushNotification("success", "Task updated successfully");
      refreshTask();
    }
  };

  const handleCommentFieldChange = (event) => {
    const { name, value } = event.target;
    setCommentForm((current) => ({ ...current, [name]: value }));
  };

  const handleAddComment = async (event) => {
    event.preventDefault();

    const result = await runAddComment(() =>
      createTaskComment(taskId, {
        author: commentForm.author,
        body: commentForm.body,
      })
    );

    if (result.ok) {
      pushNotification("success", "Comment added");
      setCommentForm(initialCommentForm);
      refreshTask();
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) {
      return;
    }

    const result = await runDeleteComment(() => deleteComment(commentToDelete.id));
    if (result.ok) {
      pushNotification("success", "Comment removed");
      setCommentToDelete(null);
      refreshTask();
    }
  };

  const handleDeleteTask = async () => {
    const result = await runDeleteTask(() => deleteTask(taskId));
    if (result.ok) {
      pushNotification("success", "Task deleted");
      navigate(`/projects/${task.projectId}/board`);
    }
  };

  if (loadingTask && !task) {
    return <LoadingSpinner label="Loading task detail" />;
  }

  if (!task) {
    return <ErrorAlert message={taskError || "Task not found"} />;
  }

  const comments = task.comments || [];
  const isOverdue = isOverdueTask(task);

  return (
    <section className="space-y-6 page-enter">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="label-soft">Task Detail</p>
          <h1 className="font-display text-4xl text-slate-900">{task.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/projects/${task.projectId}/board`}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500"
          >
            Back to Board
          </Link>
          <button
            type="button"
            onClick={() => setShowTaskDeleteDialog(true)}
            className="rounded-lg border border-slate-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-700 hover:bg-slate-100"
          >
            Delete Task
          </button>
        </div>
      </div>

      {taskError ? <ErrorAlert message={taskError} /> : null}
      {updateError ? <ErrorAlert message={updateError} /> : null}
      {addCommentError ? <ErrorAlert message={addCommentError} /> : null}
      {deleteCommentError ? <ErrorAlert message={deleteCommentError} /> : null}
      {deleteTaskError ? <ErrorAlert message={deleteTaskError} /> : null}

      <article className="card-glass space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isOverdue ? "bg-black text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Due: {formatDate(task.dueDate)}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            Project #{task.projectId}
          </span>
        </div>

        <p className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {task.description || "No description provided."}
        </p>
      </article>

      <div className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={handleTaskSubmit} className="card-glass space-y-3">
          <div>
            <p className="label-soft">Edit Task</p>
            <h2 className="mt-1 font-display text-2xl text-slate-900">Update Details</h2>
          </div>

          <div>
            <label htmlFor="title" className="text-sm font-semibold text-slate-800">
              Title
            </label>
            <input
              id="title"
              name="title"
              value={taskForm.title}
              onChange={handleTaskFieldChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <FieldError message={updateFieldErrors.title} />
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-semibold text-slate-800">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              value={taskForm.description}
              onChange={handleTaskFieldChange}
              className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            />
            <FieldError message={updateFieldErrors.description} />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-semibold text-slate-800">
              Priority
              <select
                name="priority"
                value={taskForm.priority}
                onChange={handleTaskFieldChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {PRIORITY_VALUES.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <FieldError message={updateFieldErrors.priority} />
            </label>

            <label className="text-sm font-semibold text-slate-800">
              Status
              <select
                name="status"
                value={taskForm.status}
                onChange={handleTaskFieldChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <FieldError message={updateFieldErrors.status} />
            </label>

            <label className="text-sm font-semibold text-slate-800">
              Due Date
              <input
                type="date"
                name="dueDate"
                value={taskForm.dueDate}
                onChange={handleTaskFieldChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <FieldError message={updateFieldErrors.dueDate} />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateLoading}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        <div className="space-y-4">
          <form onSubmit={handleAddComment} className="card-glass space-y-3">
            <div>
              <p className="label-soft">Comments</p>
              <h2 className="mt-1 font-display text-2xl text-slate-900">Add A Comment</h2>
            </div>

            <div>
              <label htmlFor="author" className="text-sm font-semibold text-slate-800">
                Author
              </label>
              <input
                id="author"
                name="author"
                value={commentForm.author}
                onChange={handleCommentFieldChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <FieldError message={addCommentFieldErrors.author} />
            </div>

            <div>
              <label htmlFor="body" className="text-sm font-semibold text-slate-800">
                Comment
              </label>
              <textarea
                id="body"
                name="body"
                rows={3}
                value={commentForm.body}
                onChange={handleCommentFieldChange}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
              <FieldError message={addCommentFieldErrors.body} />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={addCommentLoading}
                className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {addCommentLoading ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>

          <div className="card-glass space-y-3">
            <h3 className="font-display text-2xl text-slate-900">Comment Thread</h3>

            {comments.length === 0 ? (
              <p className="text-sm text-slate-600">No comments yet.</p>
            ) : (
              <ul className="space-y-3">
                {comments.map((comment, index) => (
                  <li
                    key={comment.id}
                    className="rounded-xl border border-slate-200 bg-white p-3"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{comment.author}</p>
                        <p className="text-xs text-slate-500">{formatDate(comment.createdAt)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCommentToDelete(comment)}
                        className="rounded-lg border border-slate-500 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-900 transition hover:border-slate-700 hover:bg-slate-100"
                      >
                        Delete
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{comment.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(commentToDelete)}
        title="Delete comment"
        message="This comment will be permanently removed."
        confirmLabel="Delete comment"
        busy={deleteCommentLoading}
        onCancel={() => setCommentToDelete(null)}
        onConfirm={handleDeleteComment}
      />

      <ConfirmDialog
        open={showTaskDeleteDialog}
        title="Delete task"
        message="This task and all comments will be permanently deleted."
        confirmLabel="Delete task"
        busy={deleteTaskLoading}
        onCancel={() => setShowTaskDeleteDialog(false)}
        onConfirm={handleDeleteTask}
      />
    </section>
  );
};

export default TaskDetailPage;
