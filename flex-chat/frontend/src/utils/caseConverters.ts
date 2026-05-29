export const toCamelCase = (str: string) =>
  str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const toSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);