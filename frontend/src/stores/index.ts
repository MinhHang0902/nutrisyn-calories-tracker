import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, UserProfile } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
        set({ user, token, isAuthenticated: true });
      },
      setUser: (user) => {
        set({ user });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({ token: state.token }),
    }
  )
);

interface UserProfileState {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  todayNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  updateTodayNutrition: (nutrition: Partial<UserProfileState["todayNutrition"]>) => void;
}

export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
      todayNutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      },
      updateTodayNutrition: (nutrition) =>
        set((state) => ({
          todayNutrition: { ...state.todayNutrition, ...nutrition },
        })),
    }),
    {
      name: "user-profile-storage",
    }
  )
);
