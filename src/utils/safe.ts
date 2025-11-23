export async function safe<T>(
  promise: Promise<T> | (() => T),
): Promise<[T | null, Error | null]> {
  try {
    const result = promise instanceof Promise ? await promise : promise()
    return [result, null]
  }
  catch (err) {
    return [null, err instanceof Error ? err : new Error(String(err))]
  }
}
