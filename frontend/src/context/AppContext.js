import { createContext, useCallback, useContext, useMemo, useState } from "react";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((current) => current.filter((item) => item.id !== id));
  }, []);

  const pushNotification = useCallback((type, message) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setNotifications((current) => [...current, { id, type, message }]);

    setTimeout(() => {
      removeNotification(id);
    }, 4000);
  }, [removeNotification]);

  const value = useMemo(() => ({
    selectedProject,
    setSelectedProject,
    notifications,
    pushNotification,
    removeNotification,
  }), [selectedProject, notifications, pushNotification, removeNotification]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
};
