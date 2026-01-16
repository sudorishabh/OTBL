export function capitalFirstLetter(input: string) {
  if (!input) return input;
  const str = input.trim();
  return str.charAt(0).toUpperCase() + str.slice(1);
}
