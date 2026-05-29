import { useNavigate } from "react-router-dom";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
}

export const useNavigateWithToast = () => {
  const navigate = useNavigate();
  return (path: string, message: string, type: ToastType = "success") => {
    navigate(path, {
      state: {
        toast: { message, type } as ToastState,
      },
    });
  };
};