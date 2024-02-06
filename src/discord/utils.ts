export function limitString(str: string, limit: number = 2000): string {
  if (str.length <= limit) return str;
  return str.slice(0, limit - 3) + '...';
}
