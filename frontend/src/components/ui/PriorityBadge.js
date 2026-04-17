import { PRIORITY_LABELS } from "../../constants";

const priorityStyleMap = {
  Low: "bg-white text-slate-700 border-slate-300",
  Medium: "bg-slate-100 text-slate-700 border-slate-400",
  High: "bg-slate-200 text-slate-800 border-slate-500",
  Critical: "bg-black text-white border-black",
};

const PriorityBadge = ({ priority }) => {
  const tone = priorityStyleMap[priority] || "bg-slate-100 text-slate-600 border-slate-300";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
};

export default PriorityBadge;
