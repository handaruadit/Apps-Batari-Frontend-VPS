//===== (parseJsonSafe) ======
export function parseJsonSafe(value) {
  try {
    return value ? JSON.parse(value) : {};
  } catch {
    return {};
  }
}
