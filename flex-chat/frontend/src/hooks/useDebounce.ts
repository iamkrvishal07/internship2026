import { useRef } from "react";

import { DEFAULT_DEBOUNCE_DELAY } from "../constants/defaults";

const useFuncDebounce = <T extends (...args: any[]) => void>(
  func: T,
  delay: number = DEFAULT_DEBOUNCE_DELAY
) => {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFunc = (...args: Parameters<T>) => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      func(...args);
    }, delay);
  };

  return debouncedFunc;
};

export default useFuncDebounce;