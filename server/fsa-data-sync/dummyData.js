// Import requried modules


// Create a funcition that turns dummy data on requests
// Places array and establishments array


const getDummyData = async() => {

// Dummy list of items (Google Places) to search
    // with place.name, place.postcode, place.addressline1, place.addressline2 as keys

places = [
        {
            name: "The Old Thai House",
            postcode: "W1T 1JY",
            addressline1: "1-2 Whitfield Street",
            addressline2: "Fitzrovia"
        },
        {
            name: "Thai Metro",
            postcode: "W1T 1JY",
            addressline1: "11-24 Whitfield Street",
            addressline2: "Fitzrovia"
        },
        {
            name: "Thai House Camden",
            postcode: "NW1 8AH",
            addressline1: "1-2 Old Street",
            addressline2: "Camden"
        },
        {
            name: "Joe's Cafe",
            postcode: "E1 6DT",
            addressline1: "123 Main Street",
            addressline2: "Whitechapel"
        },
        {
            name: "McDonald's",
            postcode: "N1 6AA",
            addressline1: "42 High Street",
            addressline2: "Islington"
        },
        {
            name: "Pizza Express",
            postcode: "N1 6AA",
            addressline1: "15 Camden Road",
            addressline2: "Islington"
        },
        {
            name: "Burger King",
            postcode: "E2 9DT",
            addressline1: "55 Commercial Street",
            addressline2: "Shoreditch"
        },
        {
            name: "KFC",
            postcode: "N1 1AA",
            addressline1: "78 Angel Street",
            addressline2: "Islington"
        }
    ];


    // Dummy Establishments data
    let establishments = [
        {
            // Thai restaurant in Fitzrovia
            name: "Old Thai House", // name is slightly different from the place name
            postcode: "W1T1JY", // postcode is missing a space
            addressline1: "1-2 Whitfield Street",
            addressline4: "Fitzrovia", // Addresslines do not match up
            rating: 5
        },
        {
            // Thai restaurant in Fitzrovia with a slightly different name
            name: "Thai-Metro", // name is slightly different
            postcode: "W1T1JT", // postcode has a typo
            addressline1: "11-24 Whitfield Street",
            addressline4: "fitzrovia", // Addresslines do not match and lack consistent capitalisation
            rating: 4
        },
        {
            // Thai restaurant in Camden
            name: "Thai House Camden", // Matches place name
            postcode: "NW1 8AH", // Matches place postcode
            addressline1: "1-2 Old Street",
            addressline4: "Camden", // Matches place addressline4
            rating: 3
        },
        {
            // Cafe in Whitechapel
            name: "Joe's Cafe",
            postcode: "E1 6DT",
            addressline1: "123 Main Street",
            addressline4: "Whitechapel",
            rating: 5
        },
        {
            // Fast food chain in Islington
            name: "Mc Donald's", // Slight variation in name
            postcode: "N1 6AA",
            addressline1: "42 High Street",
            addressline4: "Islington",
            rating: 4
        },
        {
            // Pizza chain in Islington
            name: "Pizza Express",
            postcode: "N1 6AA",
            addressline1: "15 Camden Road",
            addressline4: "Islington",
            rating: 5
        },
        {
            // Fast food chain in Shoreditch
            name: "Burger King",
            postcode: "E2 9DT",
            addressline1: "55 Commercial Street",
            addressline4: "Shoreditch",
            rating: 3
        },
        {
            // Chicken restaurant in Islington
            name: "K F C", // Name with extra spaces
            postcode: "N1 1AA",
            addressline1: "78 Angel Street",
            addressline4: "Islington",
            rating: 4
        }
    ];

    return({places,establishments});

};

module.exports = getDummyData;

    // Desired  of dummy data being run in fuzzySearch.js
   /*
[
    "Matched: The Old Thai House -> Old Thai House, Rating: 5",
    "Matched: Thai Metro -> Thai-Metro, Rating: 4",
    "Matched: Thai House Camden -> Thai House Camden, Rating: 3",
    "Matched: Joe's Cafe -> Joe's Cafe, Rating: 5",
    "Matched: McDonald's -> Mc Donald's, Rating: 4",
    "Matched: Pizza Express -> Pizza Express, Rating: 5",
    "Matched: Burger King -> Burger King, Rating: 3",
    "Matched: KFC -> K F C, Rating: 4"
]
*/