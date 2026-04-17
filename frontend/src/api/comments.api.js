import { apiRequest } from "./client";

export const getTaskComments = async (taskId) => {
  const response = await apiRequest(`/api/tasks/${taskId}/comments`);
  return response.data;
};

export const createTaskComment = async (taskId, body) => {
  const response = await apiRequest(`/api/tasks/${taskId}/comments`, {
    method: "POST",
    body,
  });
  return response.data;
};

export const deleteComment = async (commentId) => {
  const response = await apiRequest(`/api/comments/${commentId}`, {
    method: "DELETE",
  });
  return response.data;
};
