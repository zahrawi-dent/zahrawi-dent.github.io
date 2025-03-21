function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  return new Date(date).toLocaleDateString(undefined, options);
}
function getReadingTime(s: string) {
  const wpm = 200;

  const n = s
    .replace(/[^\w\s]/gi, "")
    .replaceAll("\r", "")
    .replaceAll("\n", "")
    .split(" ").length;

  return Math.ceil(n / wpm);
}

export { formatDate, getReadingTime };
