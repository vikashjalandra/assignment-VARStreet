import { useAppContext } from "../../context/AppContext";

const toneMap = {
  success: "border-slate-900 bg-slate-900 text-white",
  error: "border-slate-600 bg-slate-200 text-slate-900",
  info: "border-slate-300 bg-white text-slate-900",
};

const NotificationList = () => {
  const { notifications, removeNotification } = useAppContext();

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-40 flex w-[min(92vw,360px)] flex-col gap-2">
      {notifications.map((notification) => {
        const tone = toneMap[notification.type] || toneMap.info;

        return (
          <div
            key={notification.id}
            className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm font-medium shadow-md transition-all duration-300 ${tone}`}
          >
            <div className="flex items-start justify-between gap-3">
              <p>{notification.message}</p>
              <button
                type="button"
                onClick={() => removeNotification(notification.id)}
                className="text-xs font-bold uppercase tracking-wide opacity-70 transition hover:opacity-100"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationList;
