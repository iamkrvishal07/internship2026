import { useEffect, useRef,useState } from "react";

import {
  STREAMING_CHAR_DELAY,
  STREAMING_SHORT_THRESHOLD,
  STREAMING_WORD_DELAY,
} from "../../constants/defaults";

export const StreamingMessage = ({
  content,
  onDone,
}: {
  content: string;
  onDone: () => void;
}) => {
  const [displayed, setDisplayed] = useState("");
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setDisplayed("");
    const isShort = content.length <= STREAMING_SHORT_THRESHOLD;
    const chunks = isShort ? content.split("") : content.split(" ");

    const iv = setInterval(
      () => {
        indexRef.current++;
        setDisplayed(
          isShort
            ? content.slice(0, indexRef.current)
            : chunks.slice(0, indexRef.current).join(" "),
        );
        if (indexRef.current >= chunks.length) {
          clearInterval(iv);
          onDone();
        }
      },
      isShort ? STREAMING_CHAR_DELAY : STREAMING_WORD_DELAY,
    );

    return () => clearInterval(iv);
  }, [content]);

  return <span>{displayed}</span>;
};

export const SendingIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path strokeLinecap="round" d="M12 6v6l3.5 2" />
  </svg>
);

export const SingleTick = () => (
  <svg width="13" height="11" viewBox="0 0 24 16" fill="none" stroke="#9ca3af" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 8l6 6L22 1" />
  </svg>
);

export const DoubleTick = ({ blue }: { blue: boolean }) => (
  <svg
    width="16"
    height="11"
    viewBox="0 0 28 16"
    fill="none"
    stroke={blue ? "#3b82f6" : "#9ca3af"}
    strokeWidth="2.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M2 8l5 5L17 2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 8l5 5L25 2" />
  </svg>
);

export const ActionBtn = ({
  icon: Icon,
  label,
  onClick,
  danger,
  active,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`w-8 h-8 flex items-center justify-center rounded-full border transition-colors
      ${
        danger
          ? "border-gray-200 bg-white text-red-400 hover:bg-red-50"
          : active
          ? "border-indigo-200 bg-indigo-50 text-indigo-500"
          : "border-gray-200 bg-white text-gray-400 hover:bg-gray-100"
      }`}
  >
    <Icon size={14} />
  </button>
);