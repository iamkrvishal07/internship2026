import { z } from "zod";

const isValidColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  return hexRegex.test(color) || rgbRegex.test(color);
};

export const createThemeBaseSchema = z.object({
  name: z
    .string()
    .min(1, "Theme name is required")
    .min(3, "Theme name must be at least 3 characters")
    .max(100, "Theme name must not exceed 100 characters"),
  properties: z.record(z.string().or(z.number()), z.string()),
});

export const validateThemeProperties = (
  properties: Record<number | string, string>,
  propertyTypes: Array<{
    id: number;
    displayName: string;
    propertyType: string;
    isRequired: boolean;
  }>
) => {
  const errors: Array<{ path: string[]; message: string }> = [];

  propertyTypes.forEach((pt) => {
    const value = properties[pt.id];

    if (pt.isRequired && (!value || value.trim() === "")) {
      errors.push({
        path: ["properties", String(pt.id)],
        message: `${pt.displayName} is required`,
      });
      return;
    }

    if (!pt.isRequired && (!value || value.trim() === "")) {
      return;
    }

    if (pt.propertyType === "color") {
      if (!isValidColor(value)) {
        errors.push({
          path: ["properties", String(pt.id)],
          message: `${pt.displayName} must be a valid color (hex like #000 or #000000, or rgb)`,
        });
      }
      return;
    }

    if (pt.propertyType === "number") {
      if (isNaN(Number(value))) {
        errors.push({
          path: ["properties", String(pt.id)],
          message: `${pt.displayName} must be a valid number`,
        });
      }
      return;
    }

    if (pt.propertyType === "boolean") {
      if (value !== "true" && value !== "false") {
        errors.push({
          path: ["properties", String(pt.id)],
          message: `${pt.displayName} must be true or false`,
        });
      }
      return;
    }
  });

  return {
    success: errors.length === 0,
    error: {
      errors,
    },
  };
};
