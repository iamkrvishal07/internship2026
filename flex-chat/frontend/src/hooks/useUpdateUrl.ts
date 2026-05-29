import { useLocation,useNavigate } from "react-router-dom";

import { buildUrl } from "../utils/buildUrl";

import type { QueryValue } from "../types/common";

export const useUpdateUrl = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    basePath: string,
    params: Record<string, QueryValue>,
    replace = true
  ) => {
    const current = new URLSearchParams(location.search);

    const merged: Record<string, QueryValue> = {};

    current.forEach((value, key) => {
      merged[key] = value;
    });

    const url = buildUrl(basePath, {
      ...merged,
      ...params,
    });

    navigate(url, { replace });
  };
};