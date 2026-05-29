import { useCheckUsername } from "../../hooks/tanstackQuery/useUserApi";
import AvailabilityField from "./AvailabilityField";

import type { UseFormRegisterReturn } from "react-hook-form";

interface UsernameFieldProps {
  registration: UseFormRegisterReturn;
  error?: string;
}

export default function UsernameField({ registration, error }: UsernameFieldProps) {
  return (
    <AvailabilityField
      registration={registration}
      error={error}
      type="text"
      placeholder="Username"
      useCheckHook={useCheckUsername}
      showStatusWhen={(val) => val.length >= 3}
      unavailableMessage="Username is already taken"
      unavailableLabel="taken"
    />
  );
}