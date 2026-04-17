import { STATUS_LABELS } from "../../constants";

const statusStyleMap = {
  Todo: "bg-white text-slate-700 border-slate-300",
  InProgress: "bg-slate-100 text-slate-700 border-slate-400",
  Review: "bg-slate-200 text-slate-800 border-slate-500",
  Done: "bg-black text-white border-black",
};

const StatusBadge = ({ status }) => {
  const tone = statusStyleMap[status] || "bg-slate-100 text-slate-600 border-slate-300";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
};

export default StatusBadge;
