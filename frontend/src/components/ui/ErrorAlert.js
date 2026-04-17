const ErrorAlert = ({ message }) => {
  if (!message) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-400 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900">
      {message}
    </div>
  );
};

export default ErrorAlert;
