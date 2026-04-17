import { apiRequest } from "./client";

export const getTaskById = async (taskId) => {
  const response = await apiRequest(`/api/tasks/${taskId}`);
  return response.data;
};

export const updateTask = async (taskId, body) => {
  const response = await apiRequest(`/api/tasks/${taskId}`, {
    method: "PUT",
    body,
  });
  return response.data;
};

export const deleteTask = async (taskId) => {
  const response = await apiRequest(`/api/tasks/${taskId}`, {
    method: "DELETE",
  });
  return response.data;
};
