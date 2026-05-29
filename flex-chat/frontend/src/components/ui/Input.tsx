import { z } from "zod";

import type { userProfileSchema } from "../../schemas/userProfileSchema";
import type { UseFormRegister } from "react-hook-form";

type UserProfile = z.infer<typeof userProfileSchema>;

interface InputProps {
  type?: string;
  name: keyof UserProfile | null;
  value?: string;
  register?: UseFormRegister<UserProfile>;
  error?: string | null;
  isEditable?: boolean;
}

const baseClass =
  "w-full h-12 px-5 rounded-2xl text-white transition-all duration-200 outline-none";

const editableClass =
  "bg-white/10 border border-[#8e8ee7]/30 focus:ring-2 focus:ring-[#a29bfe] focus:border-[#a29bfe] hover:border-[#a29bfe]/60";

const readonlyClass =
  "bg-white/5 border border-white/10 text-gray-300 cursor-default";

function Input({
  type = "text",
  name,
  value,
  register,
  error,
  isEditable = false,
}: InputProps) {
  const isRegistered = name != null && register != null;

  return (
    <div>
      <input
        type={type}
        {...(isRegistered ? register(name) : {})}
        defaultValue={value}
        readOnly={!isEditable || !isRegistered}
        className={`${baseClass} ${isEditable && isRegistered ? editableClass : readonlyClass}`}
      />
      {isRegistered && (
        <p className="mt-1 h-5 text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}

export default Input;