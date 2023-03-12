export function isErrorNumObj<T extends object>(
  obj: T
): obj is T & { errNum: unknown } {
  return obj && 'errNum' in obj;
}
export function isErrorMessageObj<t extends object>(
  obj: t
): obj is t & { message: unknown } {
  return obj && 'message' in obj;
}
