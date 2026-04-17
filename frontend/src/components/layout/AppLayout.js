import { NavLink, Outlet } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import NotificationList from "../ui/NotificationList";

const navLinkClassName = ({ isActive }) => {
  const base = "rounded-full px-4 py-2 text-sm font-semibold transition-all";
  if (isActive) {
    return `${base} bg-slate-900 text-white shadow-md`;
  }

  return `${base} text-slate-700 hover:bg-slate-200/70`;
};

const AppLayout = () => {
  const { selectedProject } = useAppContext();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <NotificationList />

      <header className="relative z-10 border-b border-slate-300 bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <div>
            <p className="font-display text-2xl font-semibold text-slate-900">Task Pulse Workspace</p>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              Project-driven task operations
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2">
            <NavLink to="/dashboard" className={navLinkClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={navLinkClassName}>
              Projects
            </NavLink>
            {selectedProject ? (
              <NavLink to={`/projects/${selectedProject.id}/board`} className={navLinkClassName}>
                {selectedProject.name}
              </NavLink>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
