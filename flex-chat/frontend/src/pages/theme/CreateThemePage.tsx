import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import z from 'zod';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import {
    useGetThemePropertyTypes,
    useCreateTheme,
} from '../../hooks/tanstackQuery/useThemeApi';
import { createThemeBaseSchema, validateThemeProperties } from '../../schemas/themeSchema';
import routes from '../../constants/routes/routes';
import Loader from '../../components/common/Loader';

type CreateThemeFormData = z.infer<typeof createThemeBaseSchema>;

const isValidColor = (color: string): boolean => {
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
    return hexRegex.test(color) || rgbRegex.test(color);
};

const CreateThemePage = () => {
    const navigate = useNavigate();
    const { data: propertyTypes, isLoading } = useGetThemePropertyTypes();

    const { mutateAsync: createThemeAsync, isPending } = useCreateTheme();

    const defaultProperties = propertyTypes
        ? Object.fromEntries(
            propertyTypes.map((pt) => [
                String(pt.id),
                pt.propertyType === 'boolean' ? 'false' : (pt.defaultValue ?? ''),
            ])
        )
        : {};

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<CreateThemeFormData>({
        resolver: zodResolver(createThemeBaseSchema),
        mode: 'onChange',
        values: {
            name: '',
            properties: defaultProperties,
        },
    });

    const onSubmit = async (data: CreateThemeFormData) => {
        if (propertyTypes) {
            const validation = validateThemeProperties(data.properties, propertyTypes);
            if (!validation.success) {
                validation.error.errors.forEach((err) => toast.error(err.message));
                return;
            }
        }

        const propertiesArray = Object.entries(data.properties).map(([key, value]) => ({
            propertyTypeId: Number(key),
            propertyValue: value,
        }));

        await createThemeAsync({ name: data.name, properties: propertiesArray });
        navigate(routes.themes);
    };

    if (isLoading) return <Loader />;
    console.log(propertyTypes);
    console.log("prp type");

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-gray-900">Create Theme</h1>
                    <button
                        onClick={() => navigate(routes.themes)}
                        className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition-colors"
                    >
                        Back to List
                    </button>
                </div>

                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="p-5 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">Create New Theme</h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="p-5 bg-gray-50 space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold mb-2 text-gray-700">
                                    Theme Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="Enter theme name"
                                    {...register('name')}
                                    className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                                )}
                            </div>

                            {propertyTypes?.map((pt) => (
                                <div key={pt.id}>
                                    <label className="block text-sm font-semibold mb-2 text-gray-700">
                                        {pt.displayName}
                                        {pt.isRequired && <span className="text-red-500 ml-1">*</span>}
                                    </label>
                                    <p className="text-xs text-gray-500 mb-3">{pt.description}</p>

                                    {pt.propertyType === 'color' && (
                                        <Controller
                                            name={`properties.${pt.id}` as const}
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex gap-3 items-center">
                                                    <input
                                                        type="color"
                                                        value={isValidColor(field.value) ? field.value : pt.defaultValue}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        className="w-14 h-10 rounded cursor-pointer border-2 border-gray-300"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        placeholder={pt.defaultValue}
                                                        className={`flex-1 px-3 py-2 border-2 rounded font-mono text-sm ${errors?.properties?.[pt.id] ? 'border-red-500' : 'border-gray-300'
                                                            }`}
                                                    />
                                                </div>
                                            )}
                                        />
                                    )}

                                    {pt.propertyType === 'number' && (
                                        <input
                                            type="number"
                                            {...register(`properties.${pt.id}` as const)}
                                            placeholder={pt.defaultValue}
                                            className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors?.properties?.[pt.id] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                    )}

                                    {pt.propertyType === 'text' && (
                                        <input
                                            type="text"
                                            {...register(`properties.${pt.id}` as const)}
                                            placeholder={pt.defaultValue}
                                            className={`w-full px-3 py-2 border-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors?.properties?.[pt.id] ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                    )}

                                    {pt.propertyType === 'boolean' && (
                                        <Controller
                                            name={`properties.${pt.id}` as const}
                                            control={control}
                                            render={({ field }) => (
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => field.onChange(field.value === 'true' ? 'false' : 'true')}
                                                        className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${field.value === 'true' ? 'bg-blue-500' : 'bg-gray-300'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${field.value === 'true' ? 'translate-x-7' : 'translate-x-1'
                                                                }`}
                                                        />
                                                    </button>
                                                    <span className="text-sm text-gray-700">
                                                        {field.value === 'true' ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </div>
                                            )}
                                        />
                                    )}

                                    {pt.defaultValue && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            Default: <span className="font-mono">{pt.defaultValue}</span>
                                        </p>
                                    )}
                                </div>
                            ))}

                            <div className="flex gap-2 pt-6 border-t border-gray-200">
                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isPending ? 'Creating...' : 'Create Theme'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(routes.themes)}
                                    disabled={isPending}
                                    className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateThemePage;