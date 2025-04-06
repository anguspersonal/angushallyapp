const { getAggregateStats } = require('./aggregateService');

async function testAggregates() {
    try {
        // Test alcohol aggregates
        console.log('Testing alcohol aggregates:');
        const alcoholStats = await getAggregateStats('alcohol', 'week');
        console.log('Alcohol stats:', alcoholStats);

        // Test exercise aggregates
        console.log('\nTesting exercise aggregates:');
        const exerciseStats = await getAggregateStats('exercise', 'week');
        console.log('Exercise stats:', exerciseStats);

        // Test habit aggregates
        console.log('\nTesting habit aggregates:');
        const habitStats = await getAggregateStats('habit', 'week');
        console.log('Habit stats:', habitStats);

    } catch (error) {
        console.error('Error testing aggregates:', error);
    }
}

testAggregates(); 