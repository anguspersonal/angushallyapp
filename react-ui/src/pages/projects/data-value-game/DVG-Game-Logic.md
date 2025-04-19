// Game logic
// Game Start, index = 0
// Player sees starting industry, which is randomly selected from the industries array
// Player is prompted: Select another industry, and guess if the value is higher or lower.
// Player selects another industry
// Card is shown as selected
// Industry is stored as selectedIndustry.
// Player selects higher or lower
// If player selects higher, check if selectedIndustry.dataValue > currentIndustry.dataValue
// If player selects lower, check if selectedIndustry.dataValue < currentIndustry.dataValue
// If correct, increment score, set selectedIndustry as currentIndustry, reset guess
// If incorrect, decrement lives, check if lives === 0, set gameStatus to lost
// If gameStatus is lost, show lose screen
// If gameStatus is won, show win screen
// If gameStatus is playing, show game board
// Player can continue playing until gameStatus is lost or won