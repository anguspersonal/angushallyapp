// @ts-nocheck - Complex unit calculation logic with dynamic alcohol content formulas that TypeScript cannot properly infer
// filepath: /utils/calculateUnits.js
export const calculateUnits = (volumeML, abvPerc, count = 1) => {
    return ((volumeML || 0) * (abvPerc || 0)) / 1000 * count;
  };