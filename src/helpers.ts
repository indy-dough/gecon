export function isPromise(obj: any): boolean {
  return typeof obj?.then === 'function';
}

export function isGenerator(obj: any): boolean {
  return typeof obj?.next === 'function';
}

export function isChunk(obj: any): boolean {
  return obj?.identifier === 'chunk';
}
