import { apiRequest } from "./client";

const toQueryString = (params) => {
  const searchParams = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  return searchParams.toString();
};

export const getProjects = async () => {
  const response = await apiRequest("/api/projects");
  return response.data;
};

export const getProjectById = async (projectId) => {
  const response = await apiRequest(`/api/projects/${projectId}`);
  return response.data;
};

export const createProject = async (body) => {
  const response = await apiRequest("/api/projects", {
    method: "POST",
    body,
  });
  return response.data;
};

export const updateProject = async (projectId, body) => {
  const response = await apiRequest(`/api/projects/${projectId}`, {
    method: "PUT",
    body,
  });
  return response.data;
};

export const deleteProject = async (projectId) => {
  const response = await apiRequest(`/api/projects/${projectId}`, {
    method: "DELETE",
  });
  return response.data;
};

export const getProjectTasks = async (projectId, query = {}) => {
  const queryString = toQueryString(query);
  const path = queryString
    ? `/api/projects/${projectId}/tasks?${queryString}`
    : `/api/projects/${projectId}/tasks`;

  return apiRequest(path);
};

export const createTaskForProject = async (projectId, body) => {
  const response = await apiRequest(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    body,
  });
  return response.data;
};
