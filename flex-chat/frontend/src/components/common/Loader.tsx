interface LoaderProps {
  message?: string;
}

function Loader({ message = "Loading" }: LoaderProps) {
  return (
<div className="fixed inset-0 z-50 flex items-center justify-center"
  style={{ backgroundColor: "rgba(30, 30, 47, 0.6)" }}
>      <div className="flex flex-col items-center gap-5">

        <div className="relative w-20 h-20 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full border border-[#a29bfe]/30"
            style={{ animation: "pulseRing 2s ease-in-out infinite" }}
          />
          <div
            className="absolute -inset-2.5 rounded-full border border-[#a29bfe]/15"
            style={{ animation: "pulseRing 2s ease-in-out infinite 0.4s" }}
          />

          <svg
            className="animate-spin"
            style={{ animationDuration: "0.9s" }}
            width="52" height="52" viewBox="0 0 52 52" fill="none"
          >
            <circle cx="26" cy="26" r="22" stroke="rgba(162,155,254,0.15)" strokeWidth="3" />
            <path
              d="M26 4 A22 22 0 0 1 48 26"
              stroke="#a29bfe"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute w-3.5 h-3.5 rounded-full bg-[#6c5ce7]/60" />
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-[#dcd6f7] text-sm font-semibold tracking-wide m-0">
            {message}
          </p>
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#a29bfe]"
                style={{ animation: `pulseRing 1.2s ease-in-out infinite ${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Loader;


