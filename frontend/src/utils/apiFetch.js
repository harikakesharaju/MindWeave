import BASEURL from "../config";

const apiFetch = (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  return fetch(`${BASEURL}${path}`, { ...options, headers });
};

export default apiFetch;
