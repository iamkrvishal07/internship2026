import { useEffect, useState } from 'react';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { useGetThemePropertyTypes } from '../../hooks/tanstackQuery/useThemeApi';
import Loader from '../../components/common/Loader';

const isValidColor = (color: string): boolean => {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  return hexRegex.test(color) || rgbRegex.test(color);
};

const PropertyInputField = ({
  id,
  value,
  onChange,
}: {
  id: number;
  value: string;
  onChange?: (value: string) => void;
}) => {
  const { data: propertyTypes, isLoading } = useGetThemePropertyTypes();
  const matchedType = propertyTypes?.find((pt) => pt.id === id);
  const [inputValue, setInputValue] = useState(value || matchedType?.defaultValue || '');

  useEffect(() => {
    setInputValue(value || matchedType?.defaultValue || '');
  }, [value, matchedType?.defaultValue]);

  if (isLoading) return <Loader />;

  if (!matchedType) {
    return (
      <div className="mb-6">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          Property {id}
        </label>
        <p className="text-xs text-gray-500 mb-3">
          No property metadata was found, so this value is kept as the stored default.
        </p>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange?.(e.target.value);
          }}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    );
  }

  const handleChange = (val: string) => {
    setInputValue(val);
    onChange?.(val);
  };

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center gap-2">
        <label className="block text-sm font-semibold text-gray-700">
          {matchedType.displayName}
          {matchedType.isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>

        {matchedType.description && (
          <span className="relative inline-flex items-center group">
            <button
              type="button"
              aria-label={`${matchedType.displayName} description`}
              className="text-gray-400 hover:text-gray-700 focus:outline-none"
            >
              <HiOutlineInformationCircle size={16} />
            </button>

            <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-2 hidden w-64 -translate-x-1/2 rounded-md bg-gray-900 px-3 py-2 text-xs leading-5 text-white shadow-lg group-hover:block group-focus-within:block">
              {matchedType.description}
            </span>
          </span>
        )}
      </div>

      {matchedType.propertyType === 'color' && (
        <div className="flex gap-3 items-center">
          <input
            type="color"
            value={isValidColor(inputValue) ? inputValue : (matchedType.defaultValue || '#000000')}
            onChange={(e) => handleChange(e.target.value)}
            className="w-14 h-10 rounded cursor-pointer border-2 border-gray-300"
          />
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={matchedType.defaultValue}
            className={`flex-1 px-3 py-2 border-2 rounded font-mono text-sm ${
              isValidColor(inputValue) ? 'border-gray-300' : 'border-red-300'
            }`}
          />
        </div>
      )}

      {matchedType.propertyType === 'number' && (
        <input
          type="number"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={matchedType.defaultValue}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {matchedType.propertyType === 'text' && (
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={matchedType.defaultValue}
          className="w-full px-3 py-2 border-2 border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {matchedType.propertyType === 'boolean' && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleChange(inputValue === 'true' ? 'false' : 'true')}
            className={`relative inline-flex h-8 w-14 rounded-full transition-colors ${
              inputValue === 'true' ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform mt-1 ${
                inputValue === 'true' ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm text-gray-700">
            {inputValue === 'true' ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      )}

      {matchedType.defaultValue && (
        <p className="text-xs text-gray-400 mt-2">
          Default: <span className="font-mono">{matchedType.defaultValue}</span>
        </p>
      )}
    </div>
  );
};

export default PropertyInputField;