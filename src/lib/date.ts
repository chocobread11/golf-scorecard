export function getRoundDateInfo(timestamp: number) {
  const date = new Date(timestamp);

  return {
    day: date.toLocaleDateString("en-US", { weekday: "long" }),
    shortDay: date.toLocaleDateString("en-US", { weekday: "short" }),
    date: date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    iso: date.toISOString(), // for DB later
  };
}
