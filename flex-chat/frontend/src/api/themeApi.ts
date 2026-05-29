import apiRoutes from "../constants/routes/apiRoutes";
import api from ".";
import type { CreateOrUpdateTheme, Theme, ThemePropertyType } from "../types/theme";
import type { GetPaginatedQueryParams } from "../types/common";

const themeApi = {
    getAllThemes: async (params : GetPaginatedQueryParams) : Promise<Theme[]>=>{
        const res = await api.get(apiRoutes.theme.base, {params});

        return res.data;
    },

    getThemesByName: async (name : string,params: GetPaginatedQueryParams): Promise<Theme[]> => {
        const res = await api.get(apiRoutes.theme.getThemeByName(name), {params});

        return res.data;
    },

    createTheme: async ( theme: CreateOrUpdateTheme ) : Promise<Theme> =>{
        const res = await api.post(apiRoutes.theme.base,theme);

        return res.data;
    },

    getThemeById: async (id : number) : Promise<Theme> => {
        const res = await api.get(apiRoutes.theme.getOrUpdateOrDeleteThemeById(id));

        return res.data;
    },

    updateThemeById: async ( id: number, theme: CreateOrUpdateTheme) : Promise<Theme> => {
        const res = await api.put(apiRoutes.theme.getOrUpdateOrDeleteThemeById(id), theme);

        return res.data;
    },

    deleteThemeById: async (id:number) => {
        await api.delete(apiRoutes.theme.getOrUpdateOrDeleteThemeById(id));
    },

    getDefaultThemeForUser: async () : Promise<Theme> => {
        const res = await api.get(apiRoutes.theme.getDefaultThemeForUser);
        return res.data;
    },

    getThemePropertyTypes: async () : Promise<ThemePropertyType[]> => {
        const res = await api.get(apiRoutes.theme.getThemePropertyTypes);
        // console.log(res.data)
        return res.data;
    },

    getElementPropertyTypeValidationConstants: async () : Promise<string[]> => {
        const res = await api.get(apiRoutes.theme.getThemeElementPropertyValidationConstants)
        return res.data;
    },

    setThemeAsDefault: async (id: number) : Promise<Theme> => {
        const res = await api.put(apiRoutes.theme.setThemeAsDefault(id));
        return res.data;
    }
};

export default themeApi;