import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white/85 p-8 text-center shadow-sm page-enter">
      <p className="label-soft">404</p>
      <h1 className="mt-1 font-display text-4xl text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-600">
        The page you requested does not exist or has moved.
      </p>
      <Link
        to="/dashboard"
        className="mt-5 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
      >
        Go to Dashboard
      </Link>
    </section>
  );
};

export default NotFoundPage;
