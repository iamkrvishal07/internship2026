
export const formatLocalTime = (
  iso?: string | null
) => {
  if (!iso) return "—";

  return new Date(iso).toLocaleTimeString(
    "en-US",
    {
      hour: "numeric",
      minute: "2-digit",
    }
  );
};

export const formatLocalDateTime = (
  iso?: string | null
) => {

  if (!iso) return "—";


  const utcString = iso.endsWith("Z")
    ? iso
    : `${iso}Z`;

  return new Date(utcString).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
};

