export const getDynamicPlaceholder = (inputWidth: number): string => {
  return inputWidth > 250
    ? "Search restaurants, cafes, pubs, bars, hotels..."
    : "Search restaurants...";
}; 