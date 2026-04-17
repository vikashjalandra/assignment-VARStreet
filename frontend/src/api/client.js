const buildRequestOptions = (options = {}) => {
  const { body, headers, ...rest } = options;

  const requestHeaders = {
    Accept: "application/json",
    ...(headers || {}),
  };

  const requestOptions = {
    ...rest,
    headers: requestHeaders,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(body);
  }

  return requestOptions;
};

export const apiRequest = async (path, options) => {
  const response = await fetch(path, buildRequestOptions(options));

  const contentType = response.headers.get("content-type") || "";
  const hasJsonBody = contentType.includes("application/json");
  const payload = hasJsonBody ? await response.json() : null;

  if (!response.ok) {
    const error = new Error(payload?.message || "Request failed");
    error.status = response.status;
    error.errors = payload?.errors || {};
    error.payload = payload;
    throw error;
  }

  return payload;
};
