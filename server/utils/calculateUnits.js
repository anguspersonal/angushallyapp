/**
 * Calculates the alcohol units for a drink.
 * 
 * This function is equivalent to the frontend version of `calculateUnits` but is implemented for backend use.
 * It calculates the total alcohol units based on the drink's volume (in milliliters), alcohol by volume percentage (ABV), and count.
 * 
 * Formula:
 *   units = (volumeML * abvPerc / 1000) * count
 * 
 * @param {number} volumeML - The volume of the drink in milliliters.
 * @param {number} abvPerc - The alcohol by volume percentage of the drink.
 * @param {number} count - The number of drinks consumed (default is 1).
 * @returns {number} - The calculated alcohol units.
 * @throws {Error} - If any input is invalid or not a positive number.
 */
function calculateUnits(volumeML, abvPerc, count = 1) {
    // Validate input types
    if (typeof volumeML !== 'number' || typeof abvPerc !== 'number' || typeof count !== 'number') {
        throw new Error("Invalid input: volumeML, abvPerc, and count must be numbers.");
    }

    // Validate input values
    if (volumeML <= 0 || abvPerc <= 0 || count <= 0) {
        throw new Error("Invalid input: volumeML, abvPerc, and count must be positive numbers.");
    }

    // Calculate and return units
    return (volumeML * abvPerc / 1000) * count;
}

module.exports = { calculateUnits };