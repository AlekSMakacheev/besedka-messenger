const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (response.status === 401) {
    console.warn("Токен истек или неверный. Разлогиниваем...");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("selectedContact");
    window.location.reload(); 
    throw new Error("Unauthorized");
  }

  return response;
};

export { API_URL };