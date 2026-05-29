export interface ThemePropertyType {
    id: number;
    key: string;
    displayName: string;
    description: string;
    defaultValue: string;
    propertyType: string;
    isRequired: boolean;
    createdAt: string;
}

export interface ThemeProperty {
    id: number;
    themeId: number;
    propertyTypeId: number;
    propertyValue: string;
    updatedAt: string;
    themePropertyType: ThemePropertyType;
}

export interface ThemePropertyMinimal {
    [key:string]:string;
}

export interface Theme {
    id: number;
    userId: number;
    name: string;
    isDefault: boolean;
    properties: ThemePropertyMinimal;
    createdAt: string;
    updatedAt: string;
}

export interface CreateOrUpdateTheme {
    name: string;
    properties: Array<{
        propertyTypeId: number;
        propertyValue: string;
    }>;
}

export interface ApiResponse<T> {
    data: T;
    message: string;
}

export type GetThemeResponse = ApiResponse<Theme>;
export type GetThemesResponse = ApiResponse<Theme[]>;
export type CreateThemeResponse = ApiResponse<Theme>;
export type UpdateThemeResponse = ApiResponse<Theme>;