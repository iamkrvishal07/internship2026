import { useEffect, useState } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { DEFAULT_DEBOUNCE_DELAY } from "../../constants/defaults";

type AvailabilityFieldProps = {
  registration: UseFormRegisterReturn;
  error?: string;
  type?: string;
  placeholder?: string;
  useCheckHook: (value: string) => { data: { isAvailable: boolean } | undefined; isLoading: boolean };
  showStatusWhen?: (val: string) => boolean;
  successMessage?: string;
  unavailableMessage?: string;
};

const AvailabilityField = ({
  registration,
  error,
  type = "text",
  placeholder,
  useCheckHook,
  showStatusWhen,
  successMessage = "Available!",
  unavailableMessage = "Already taken!",
}: AvailabilityFieldProps) => {
  const [value, setValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, DEFAULT_DEBOUNCE_DELAY);
    return () => clearTimeout(timeout);
  }, [value]);

  const shouldCheck = showStatusWhen
    ? showStatusWhen(debouncedValue)
    : debouncedValue.length >= 3;

  const { data, isLoading: isChecking } = useCheckHook(
    shouldCheck ? debouncedValue : ""
  );

  const isAvailable = data?.isAvailable;
  const isTyping = value !== debouncedValue;

  const borderClass = error
    ? "border-red-400 focus-within:ring-red-100"
    : isAvailable === false
      ? "border-red-400 focus-within:ring-red-100"
      : isAvailable === true
        ? "border-green-400 focus-within:ring-green-100"
        : "border-gray-200 focus-within:border-gray-400 focus-within:ring-gray-100";

  const renderStatus = () => {
    if ((isChecking || isTyping) && shouldCheck) {
      return (
        <span className="flex items-center gap-1 text-gray-400">
          <svg className="animate-spin w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Checking...
        </span>
      );
    }
    if (!isChecking && !isTyping && isAvailable === true) {
      return (
        <span className="flex items-center gap-1 text-green-500">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {successMessage}
        </span>
      );
    }
    if (!isChecking && !isTyping && isAvailable === false) {
      return (
        <span className="flex items-center gap-1 text-red-500">
          <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {unavailableMessage}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <div
        className={`flex items-center w-full px-4 py-3 bg-gray-50 border rounded-xl transition-all focus-within:ring-2 ${borderClass}`}
      >
        <input
          type={type}
          placeholder={placeholder}
          {...registration}
          onChange={(e) => {
            registration.onChange(e);
            setValue(e.target.value);
          }}
          className="flex-1 text-sm text-gray-900 bg-transparent outline-none placeholder-gray-400 min-w-0"
        />
        {!error && isAvailable === true && (
          <svg className="w-4 h-4 text-green-500 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {!error && isAvailable === false && (
          <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <p className="mt-1 text-xs h-4">
        {error
          ? <span className="text-red-500">{error}</span>
          : renderStatus()
        }
      </p>
    </div>
  );
};

export default AvailabilityField;