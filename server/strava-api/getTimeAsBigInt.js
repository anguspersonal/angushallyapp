// Milliseconds since epoch as a BigInt
const nowMsBigInt = BigInt(Date.now());
console.log(nowMsBigInt);

// If you want seconds since epoch, do:
const nowSecBigInt = BigInt(Math.floor(Date.now() / 1000));
console.log(nowSecBigInt);
