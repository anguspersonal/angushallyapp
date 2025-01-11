/// below is previsu way doing thsi in js. now can do in server side with sql query on heroku scheduels jobs.


// COMBINE ESTABLISHMENT ADDRESS: Combines the address lines of an establishment into a single string for easier comparison
const combineEstablishmentAddressLines = (establishment) => {
    const address = `${establishment.addressline1} ${establishment.addressline2} ${establishment.addressline4 || ''}`.trim();
    // console.log(`${establishment.name}: ${address}`);
    return { ...establishment, address }; // Adds a new `address` property to the `establishment` object
};