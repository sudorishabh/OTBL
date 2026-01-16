export function capitalizeEachWord(input: string) {
  if (!input) return input;
  const str = input
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
  return str;
}
