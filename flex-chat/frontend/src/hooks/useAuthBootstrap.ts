import { useEffect, useRef,useState } from "react";

import { useRefreshToken } from "./tanstackQuery/useAccountApi";

export const useAuthBootstrap = () => {
  const refreshMutation = useRefreshToken();
  const hasFired = useRef(false); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    refreshMutation.mutate(undefined, {
      onSettled: () => setLoading(false),
    });
  }, []); 
  return { loading };
};