import { useMemo } from "react";

import { useLocation } from "react-router-dom";

import { toCamelCase } from "../utils/caseConverters";

import type { QueryValue } from "../types/common";


 const useQueryParams = <T extends Record<string, QueryValue>>() => {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const result = {} as Partial<T>;

    for (const [key, value] of params.entries()) {
      const camelKey = toCamelCase(key) as keyof T;
      result[camelKey] = value as T[keyof T];
    }

    return result;
  }, [search]);
};
export default useQueryParams;

