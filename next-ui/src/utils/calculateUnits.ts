export const calculateUnits = (volumeML: number, abvPerc: number, count: number = 1): number => {
    return ((volumeML || 0) * (abvPerc || 0)) / 1000 * count;
}; 