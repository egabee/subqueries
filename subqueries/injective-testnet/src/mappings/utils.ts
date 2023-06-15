export function toJson(o: any): string {
  return JSON.stringify(o, (_, v) => (typeof v === 'bigint' ? v.toString() : v))
}
