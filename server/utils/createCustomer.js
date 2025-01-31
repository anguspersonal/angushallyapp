const db = require('../db'); // Import database connection

/**
 * Create or retrieve a customer based on their email.
 * @param {string} name - Customer's name.
 * @param {string} email - Customer's email (unique identifier).
 * @returns {Promise<number>} - Returns customer ID.
 */
async function createOrRetrieveCustomer(name, email) {
    try {
        // ✅ Query directly returns rows, no need for `.rows`
        const existingCustomer = await db.query(
            'SELECT id FROM customers WHERE email = $1',
            [email]
        );

        console.log('🔍 Query Result for Existing Customer:', existingCustomer); // Debugging

        if (existingCustomer.length > 0) { // ✅ Fix: Check length directly
            console.log(`✅ Customer exists: ID ${existingCustomer[0].id}`);
            return existingCustomer[0].id;
        }

        // ✅ Insert new customer
        const newCustomer = await db.query(
            'INSERT INTO customers (name, email) VALUES ($1, $2) RETURNING id',
            [name, email]
        );

        if (!newCustomer || newCustomer.length === 0) {
            console.log('🔍 Query Result for New Customer:', JSON.stringify(newCustomer, null, 2));
            throw new Error('Failed to create customer: No data returned from INSERT query.');
        }

        console.log(`✅ New customer created: ID ${newCustomer[0].id}`);
        return newCustomer[0].id;
    } catch (error) {
        console.error('❌ Error in createOrRetrieveCustomer:', error);
        throw error;
    }
}


module.exports = createOrRetrieveCustomer;