import { useEffect, useState } from 'react';
import { HiChevronDown, HiTrash } from 'react-icons/hi';
import { MdPalette } from 'react-icons/md';

import {
    useGetThemePropertyTypes,
    useSetThemeAsDefault,
    useUpdateTheme,
    useDeleteTheme,
} from '../../hooks/tanstackQuery/useThemeApi';
import ConfirmModal from '../../components/common/ConfirmModal';
import type { Theme } from '../../types/theme';
import PropertyInputField from './PropertyInputField';

const ThemeDisplay = ({
    theme,
}: {
    theme: Theme;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
    const { data: propertyTypes } = useGetThemePropertyTypes();

    const [localProperties, setLocalProperties] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!propertyTypes) return;
        const allProps: Record<string, string> = {};
        propertyTypes.forEach((pt) => {
            allProps[String(pt.id)] = theme.properties[String(pt.id)] || '';
        });
        setLocalProperties(allProps);
    }, [propertyTypes, theme.id]);

    const { mutate: setAsDefault, isPending: isSettingDefault } = useSetThemeAsDefault();
    const { mutate: updateTheme, isPending: isSaving } = useUpdateTheme();
    const { mutate: deleteTheme, isPending: isDeleting } = useDeleteTheme();

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        setIsDeleteConfirmOpen(false);
        deleteTheme(theme.id);
    };

    const handleSetAsDefault = (e: React.MouseEvent) => {
        e.stopPropagation();
        setAsDefault(theme.id, { onSuccess: () => setIsOpen(false) });
    };

    const handlePropertyChange = (key: string, value: string) => {
        setLocalProperties((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        const propertiesArray = Object.entries(localProperties).map(([key, value]) => ({
            propertyTypeId: Number(key),
            propertyValue: value,
        }));
        updateTheme({ id: theme.id, params: { name: theme.name, properties: propertiesArray } });
    };

    const handleCancel = () => {
        const allProps: Record<string, string> = {};
        propertyTypes?.forEach((pt) => {
            allProps[pt.id] = theme.properties[pt.id] || '';
        });
        setLocalProperties(allProps);
        setIsOpen(false);
    };

    return (
        <>
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                <div
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                >
                    <div className="flex items-center gap-4 flex-1 text-left">
                        <MdPalette size={24} className="text-blue-500" />
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">{theme.name}</h2>
                            {theme.isDefault && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full inline-block mt-1">
                                    Default Theme
                                </span>
                            )}
                        </div>
                    </div>

                    {!theme.isDefault && (
                        <button
                            onClick={handleSetAsDefault}
                            disabled={isSettingDefault}
                            className="mr-2 px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSettingDefault ? 'Setting...' : 'Set as Default'}
                        </button>
                    )}

                    {!theme.isDefault && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="mr-4 px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                            <HiTrash size={16} />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    )}

                    <HiChevronDown
                        size={20}
                        className={`text-gray-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    />
                </div>

                {isOpen && (
                    <div className="border-t border-gray-200 p-5 bg-gray-50">
                        <div className="space-y-6">
                            {propertyTypes?.map((pt) => (
                                <PropertyInputField
                                    key={pt.id}
                                    id={pt.id}
                                    value={localProperties[pt.id] || ''}
                                    onChange={(val) => handlePropertyChange(String(pt.id), val)}
                                />
                            ))}
                        </div>

                        <div className="flex gap-2 pt-6 border-t border-gray-200 mt-6">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 disabled:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <ConfirmModal
                isOpen={isDeleteConfirmOpen}
                title="Delete Theme"
                message={`Are you sure you want to delete the theme "${theme.name}"?`}
                confirmText="Delete"
                cancelText="Cancel"
                variant="danger"
                onConfirm={confirmDelete}
                onCancel={() => setIsDeleteConfirmOpen(false)}
            />
        </>
    );
};

export default ThemeDisplay;