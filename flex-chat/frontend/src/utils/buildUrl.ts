import { toSnakeCase } from "./caseConverters";

type QueryValue = string | number | boolean | null | undefined;

export const buildUrl = (
  basePath: string,
  params: Record<string, QueryValue> = {}
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.set(toSnakeCase(key), String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `${basePath}?${query}` : basePath;
};