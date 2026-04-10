import { create } from "zustand";

let toastId = 0;

const useToastStore = create((set) => ({
  toasts: [],

  showToast: ({ message, type = "success", duration = 3000 }) => {
    const id = ++toastId;

    set((state) => ({
      toasts: [...state.toasts, { id, message, type }],
    }));

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));

export default useToastStore;