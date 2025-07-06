// @ts-nocheck
// filepath: /utils/calculateUnits.js
export const calculateUnits = (volumeML, abvPerc, count = 1) => {
    return ((volumeML || 0) * (abvPerc || 0)) / 1000 * count;
  };