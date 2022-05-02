
export function clamp(min: number, max: number, n: number): number {
    return Math.max(min, Math.min(n, max))
}
