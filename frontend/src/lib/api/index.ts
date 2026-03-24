import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (email: string, password: string, name: string) =>
    api.post("/auth/register", { email, password, name }),
  logout: () => api.post("/auth/logout"),
};

export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data: { name?: string; avatar?: string; currentPassword?: string; newPassword?: string }) =>
    api.put("/users/profile", data),
};

export const profileAPI = {
  getProfile: () => api.get("/profile"),
  updateBodyMetrics: (data: {
    age: number;
    gender: 'male' | 'female';
    height: number;
    weight: number;
    activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
    goal: 'lose_weight' | 'gain_muscle' | 'maintain';
  }) => api.put("/profile/body-metrics", data),
};

export const mealAPI = {
  getMeals: (date?: string) => api.get("/meals", { params: { date } }),
  getMeal: (id: string) => api.get(`/meals/${id}`),
  createMeal: (data: FormData) =>
    api.post("/meals", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteMeal: (id: string) => api.delete(`/meals/${id}`),
};

export const nutritionAPI = {
  analyzeImage: (formData: FormData) =>
    api.post("/nutrition/analyze", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  searchFood: (query: string) =>
    api.get("/nutrition/search", { params: { q: query } }),
  getMealPlan: (data: {
    calories: number;
    cuisine?: string;
    mealType: string;
    ingredients?: string[];
  }) => api.post("/nutrition/meal-plan", data),
};

export const chatAPI = {
  sendMessage: (message: string, context?: any) =>
    api.post("/chat/message", { message, context }),
  getHistory: () => api.get("/chat/history"),
};
