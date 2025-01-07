
// Handle RatingValue: Allow "Exempt" and "Awaiting Inspection" Or variations of "AwaitingInspection" as valid values
// When Rating Value is one of these options, set rating_value_str to the value and rating_value_num to null
// When Rating Value is "1, 2, 3, 4, 5" set rating_value_num to the value and rating_value_str to value
// In any other case set both rating_value_str and rating_value_num to null

const getStatusId = (ratingValue) => {
    const ratingsMap = {
        "Exempt": 1,
        "Awaiting Inspection": 2,
        "AwaitingInspection": 2,
    };
    return ratingsMap[ratingValue] || null;
};

const processRatingValue = (ratingValue) => {
    let rating_value_str = null;
    let rating_value_num = null;
    let rating_status_id = null;

    if (["Exempt", "Awaiting Inspection", "AwaitingInspection"].includes(ratingValue)) {
        rating_value_str = ratingValue;
        rating_status_id = getStatusId(ratingValue); // Map to fsa.ratings.id
    } else if (/^[1-5]$/.test(ratingValue)) {
        rating_value_str = ratingValue;
        rating_value_num = parseInt(ratingValue, 10);
    }

    return { rating_value_str, rating_value_num, rating_status_id };
};


// Export the function
module.exports = processRatingValue;