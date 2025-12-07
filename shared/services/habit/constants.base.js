/**
 * Runtime shim for the Habits domain constants. The TypeScript contracts
 * module is the canonical source; this file re-exports the compiled output
 * for CommonJS consumers without duplicating literals or relying on ts-node.
 * Keep this file free of literals—regenerate the bridge from contracts.ts when
 * constants change.
 */

const { HABIT_PERIODS, HABIT_METRICS } = require('./contracts.js');

module.exports = { HABIT_PERIODS, HABIT_METRICS };
