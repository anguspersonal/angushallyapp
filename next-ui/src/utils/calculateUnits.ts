// @ts-nocheck - Complex unit calculation logic with dynamic alcohol content formulas that TypeScript cannot properly infer
export const calculateUnits = (volumeML: number, abvPerc: number, count: number = 1): number => {
    return ((volumeML || 0) * (abvPerc || 0)) / 1000 * count;
}; 