import { useEffect } from "react";

import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastState {
  message: string;
  type: ToastType;
}

function ToastListener() {
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    const toastData = location.state?.toast as ToastState | undefined;

    if (toastData?.message) {
      toast[toastData.type ?? "success"](toastData.message);

      navigate(location.pathname, {
        replace: true,
        state: {
          ...location.state,
          toast: undefined, 
        },
      });
    }
  }, [location.state?.toast]); 

  return null;
}

export default ToastListener;