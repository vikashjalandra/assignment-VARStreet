import { useEffect } from "react";
import { getDashboardSummary, getUpcomingTasks } from "../api/dashboard.api";
import ErrorAlert from "../components/ui/ErrorAlert";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { STATUS_LABELS, STATUS_VALUES } from "../constants";
import useApi from "../hooks/useApi";
import { formatDate } from "../utils/date";

const emptySummary = {
  totalProjects: 0,
  tasksByStatus: {
    Todo: 0,
    InProgress: 0,
    Review: 0,
    Done: 0,
  },
  overdueCount: 0,
  dueWithin7Days: 0,
};

const barToneMap = {
  Todo: "bg-slate-300",
  InProgress: "bg-slate-500",
  Review: "bg-slate-700",
  Done: "bg-black",
};

const DashboardPage = () => {
  const {
    data: summary,
    loading: summaryLoading,
    error: summaryError,
    execute: loadSummary,
  } = useApi(emptySummary);

  const {
    data: upcomingTasks,
    loading: upcomingLoading,
    error: upcomingError,
    execute: loadUpcoming,
  } = useApi([]);

  useEffect(() => {
    loadSummary(() => getDashboardSummary());
    loadUpcoming(() => getUpcomingTasks(10));
  }, [loadSummary, loadUpcoming]);

  const totalTasks = Object.values(summary?.tasksByStatus || {}).reduce(
    (count, value) => count + value,
    0
  );

  return (
    <section className="space-y-6 page-enter">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">Dashboard</p>
        <h1 className="font-display text-4xl text-slate-900">Operational Snapshot</h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Track workload pressure, completion momentum, and upcoming deadlines at a glance.
        </p>
      </div>

      {summaryError ? <ErrorAlert message={summaryError} /> : null}
      {upcomingError ? <ErrorAlert message={upcomingError} /> : null}

      {summaryLoading ? (
        <LoadingSpinner label="Loading dashboard summary" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="card-glass">
            <p className="label-soft">Total Projects</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-900">{summary.totalProjects}</p>
          </article>
          <article className="card-glass">
            <p className="label-soft">Total Tasks</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-900">{totalTasks}</p>
          </article>
          <article className="card-glass">
            <p className="label-soft">Due In 7 Days</p>
            <p className="mt-2 text-4xl font-extrabold text-slate-900">{summary.dueWithin7Days}</p>
          </article>
          <article className="card-glass border-black bg-black">
            <p className="label-soft text-slate-300">Overdue</p>
            <p className="mt-2 text-4xl font-extrabold text-white">{summary.overdueCount}</p>
          </article>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.25fr,1fr]">
        <article className="card-glass space-y-4">
          <div>
            <p className="label-soft">Task Status Distribution</p>
            <h2 className="mt-1 font-display text-2xl text-slate-900">Progress by Status</h2>
          </div>

          <div className="space-y-4">
            {STATUS_VALUES.map((status) => {
              const count = summary.tasksByStatus?.[status] || 0;
              const percentage = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;

              return (
                <div key={status} className="space-y-1">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
                    <span>{STATUS_LABELS[status]}</span>
                    <span>{count} tasks ({percentage}%)</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200">
                    <div
                      className={`h-2.5 rounded-full transition-all ${barToneMap[status]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="card-glass">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <p className="label-soft">Upcoming Due Tasks</p>
              <h2 className="mt-1 font-display text-2xl text-slate-900">Next 7 Days</h2>
            </div>
            <span className="rounded-full bg-black px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {upcomingTasks.length} items
            </span>
          </div>

          {upcomingLoading ? (
            <LoadingSpinner label="Loading upcoming tasks" />
          ) : upcomingTasks.length === 0 ? (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
              No upcoming due tasks for the next week.
            </p>
          ) : (
            <ul className="space-y-3">
              {upcomingTasks.map((task, index) => (
                <li
                  key={task.id}
                  className="task-tile"
                  style={{ animationDelay: `${index * 90}ms` }}
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-600">Project: {task.project?.name || "Unknown"}</p>
                  </div>
                  <p className="text-xs font-semibold text-slate-800">{formatDate(task.dueDate)}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </div>
    </section>
  );
};

export default DashboardPage;
