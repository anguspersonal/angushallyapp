// utils/getDynamicPlaceholder.js
export const getDynamicPlaceholder = (inputWidth) => {
    return inputWidth > 250
        ? "Search restaurants, cafes, pubs, bars, hotels..."
        : "Search restaurants...";
};
