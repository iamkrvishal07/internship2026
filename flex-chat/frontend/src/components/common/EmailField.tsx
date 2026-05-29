import { useCheckEmail } from "../../hooks/tanstackQuery/useUserApi";
import AvailabilityField from "./AvailabilityField";

import type { UseFormRegisterReturn } from "react-hook-form";

interface EmailFieldProps {
  registration: UseFormRegisterReturn;
  error?: string;
}

export default function EmailField({ registration, error }: EmailFieldProps) {
  return (
    <AvailabilityField
      registration={registration}
      error={error}
      type="email"
      placeholder="Email"
      useCheckHook={useCheckEmail}
      showStatusWhen={(val) => val.length >= 5 && val.includes("@")}
      unavailableMessage="Email is already registered"
      unavailableLabel="already registered"
    />
  );
}