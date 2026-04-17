import { apiRequest } from "./client";

export const getDashboardSummary = async () => {
  const response = await apiRequest("/api/dashboard");
  return response.data;
};

export const getUpcomingTasks = async (limit = 10) => {
  const response = await apiRequest(`/api/dashboard/upcoming?limit=${limit}`);
  return response.data;
};
