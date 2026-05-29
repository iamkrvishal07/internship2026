import { useRef,useState } from "react";

import type { ClipboardEvent,KeyboardEvent } from "react";

export const useOtpInput = (length: number = 6, onComplete?: (code: string) => void) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    const currentCode = newOtp.join("");
    if (currentCode.length === length && newOtp.every(d => d !== "")) {
      onComplete?.(currentCode);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);
    
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    
    const nextFocus = Math.min(pasted.length, length - 1);
    inputs.current[nextFocus]?.focus();

    const currentCode = newOtp.join("");
    if (currentCode.length === length && newOtp.every(d => d !== "")) {
      onComplete?.(currentCode);
    }
  };

  const reset = () => setOtp(Array(length).fill(""));

  return {
    otp,
    inputs,
    handleChange,
    handleKeyDown,
    handlePaste,
    reset,
    isComplete: otp.every((d) => d !== ""),
    code: otp.join(""),
  };
};
