const LoadingSpinner = ({ label = "Loading..." }) => {
  return (
    <div className="flex min-h-[140px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-300 bg-white p-6 shadow-sm">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-black" />
      <p className="text-sm font-medium text-slate-700">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
