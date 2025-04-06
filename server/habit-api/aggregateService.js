// server/habit-api/aggregateService.js
const { getAlcoholAggregates } = require('./alcoholService');
const { getExerciseAggregates } = require('./exerciseService');
const { getHabitAggregates } = require('./habitService');
// ... other habit services

const AGGREGATE_FUNCTIONS = {
    alcohol: getAlcoholAggregates,
    exercise: getExerciseAggregates,
    habit: getHabitAggregates
};

const PERIODS = {
    day: 'day',
    week: 'week',
    month: 'month',
    year: 'year',
    all: 'all'
};

const DEFAULT_METRICS = ['sum', 'avg', 'min', 'max', 'stddev'];

async function getAggregateStats(habitType, period, metrics = DEFAULT_METRICS) {
    if (!AGGREGATE_FUNCTIONS[habitType]) {
        throw new Error(`Unsupported habit type: ${habitType}`);
    }

    if (!PERIODS[period]) {
        throw new Error(`Unsupported period: ${period}`);
    }

    return await AGGREGATE_FUNCTIONS[habitType](period, metrics);
}

module.exports = { getAggregateStats };