import { usePresenceStore } from "../../stores/presenceStore";

type OnlineDotProps = {
  userId: number;
  size?: "sm" | "md";
  showOnlineText?: boolean;
};

const OnlineDot = ({ userId, size = "sm", showOnlineText = false }: OnlineDotProps) => {

  const isOnline = usePresenceStore((s) => s.isOnline(userId));
  if (!isOnline) return null;
  return (
    <span
      className={`absolute rounded-full bg-green-500 border-2 border-white flex items-center justify-center
        ${size === "sm" ? "w-2.5 h-2.5 bottom-0 right-0" : "w-3.5 h-3.5 bottom-0.5 right-0.5"}`}
      aria-label="Online"
    >
      {showOnlineText && <span className="text-[8px] text-white">online</span>}
    </span>
  );
};

export default OnlineDot;