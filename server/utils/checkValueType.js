// Description: Check the value type of the input.

const checkValueType = (value) => {
let valueType ="";

    // 1. Check if it's undefined
if (value === undefined) {
    valueType = "undefined";
    console.log("Value is undefined.");
  } 
  // 2. Check if it's null
  else if (value === null) {
    valueType = "null";
    console.log("Value is null.");
  } 
  // 3. Check if it's an array
  else if (Array.isArray(value)) {
    valueType = "array";
    console.log("Value is an array.");
  } 
  // 4. Check if it's an object
  else if (typeof value === 'object') {
    valueType = "object";
    console.log("Value is an object.");
  } 
  // 5. Handle other types (string, number, boolean, etc.)
  else {
    console.log("Value is a primitive:", typeof value);
    valueType = typeof value;
  }
  return valueType;

};

module.exports = checkValueType;