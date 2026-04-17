import { useCallback, useState } from "react";

const useApi = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const clearErrors = useCallback(() => {
    setError("");
    setFieldErrors({});
  }, []);

  const execute = useCallback(async (requestFn) => {
    setLoading(true);
    clearErrors();

    try {
      const result = await requestFn();
      setData(result);
      return { ok: true, data: result };
    } catch (requestError) {
      setError(requestError?.message || "Request failed");
      setFieldErrors(requestError?.errors || {});
      return { ok: false, error: requestError };
    } finally {
      setLoading(false);
    }
  }, [clearErrors]);

  return {
    data,
    setData,
    loading,
    error,
    fieldErrors,
    clearErrors,
    execute,
  };
};

export default useApi;
