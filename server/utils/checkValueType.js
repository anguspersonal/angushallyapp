/**
 * Utility function to check the type of a value
 * Used for debugging database responses
 */
function checkValueType(value) {
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

module.exports = checkValueType;