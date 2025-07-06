//Imports
import React, { useState, useEffect, useDebugValue } from 'react';
import './Gameboard.css'; // Ensure the correct path to the CSS file
import industries from './Industries.json'; // Import industries from the JSON file
import Win from './Win'; // Import the Win component
import Lose from './Lose'; // Import the Lose component
import CTAGuessAutomotive from './CTA-GuessAutomotive'; // Import the CTAGuessAutomotive component


//UseLabelState hook to add labels to state values
const useLabeledState = (initialState, label) => {
  const [state, setState] = useState(initialState);
  useDebugValue(`${label}: ${state}`);
  return [state, setState];
};

// Shuffle the deck and set the initial industry card
const shuffleDeck = () => {
  const shuffledDeck = industries.sort(() => 0.5 - Math.random()).map((industry) => ({
    ...industry,
    state: 'Unselected'
  }));

  // Log length of deck
  // console.log('Deck Length:', shuffledDeck.length);

  // Select the initial industry card and remove it from the deck
  const startingIndustry = shuffledDeck[Math.floor(Math.random() * shuffledDeck.length)];
  const filteredDeck = shuffledDeck.filter(industry => industry.id !== startingIndustry.id);

  // Log starting industry and deck
  // console.log('Starting Industry:', startingIndustry);
  // console.log('Filtered Deck Length:', filteredDeck.length);

  return {
    deck: filteredDeck,
    startingIndustry: startingIndustry,
  };
};

const GameBoard = (props) => {

  // State variables
  const [lives, setLives] = useLabeledState(3, 'Lives'); // Set initial lives to 3
  const [startingIndustry, setStartingIndustry] = useLabeledState(null, 'Starting Industry'); // Set the starting industry
  const [previousIndustry, setPreviousIndustry] = useLabeledState(null, 'Previous Industry'); // Set the previous industry
  const [gameStatus, setGameStatus] = useLabeledState(props.gameStatus, 'Game Status'); // 'true' or 'false'
  const [guess, setGuess] = useLabeledState(null, 'Guess'); // 'higher' or 'lower'
  const [score, setScore] = useLabeledState(0, 'Score'); // Track the score
  const [cards, setCards] = useLabeledState([], 'Cards'); // Combine industry data and card state
  const [selectedCard, setSelectedCard] = useLabeledState(null, 'Selected Industry'); // Track the selected card by index
  const [roundCounter, setRoundCounter] = useLabeledState(0, 'Round'); // Track the number of rounds played

  // Function to restart the game
  const restartGame = () => {
    const { deck, startingIndustry } = shuffleDeck();
    setLives(3);
    setStartingIndustry(startingIndustry);
    setPreviousIndustry(startingIndustry);
    setGameStatus('playing');
    setGuess(null);
    setScore(0);
    setCards(deck);
    setSelectedCard(null);
    setRoundCounter(0);
    // console.log('Game restarted');
  };

  // UseEffect hook to restart the game when the component mounts
  useEffect(() => {
    restartGame();
  }, []); // Empty dependency array ensures this runs only once

  // Function to update the card state
  const updateCardState = (index, newState) => {
    setCards(prevCards => prevCards.map((card, i) => ({
      ...card,
      state: i === index ? newState : ((card.state !== 'Flipped' && card.state !== 'Flipping') ? 'Unselected' : card.state)
    })));
  };

  // Function to handle card selection
  const handleCardSelection = (index) => {
    if (gameStatus !== 'playing' || cards[index].state === 'Flipped' || cards[index].state === 'Flipping') return; // Only apply if card is not flipped or flipping

    setSelectedCard(index);
    updateCardState(index, 'Selected');
  };

  let isCorrect = false; // Boolean to track if the guess is correct
  const selectedIndustry = cards[selectedCard]; // Get the selected industry

  // Function to handle the user's guess
  const handleGuess = (selectedGuess) => {
    {
      if (gameStatus !== 'playing' || selectedCard === null) return;
      setGuess(selectedGuess);

      if (roundCounter === 0) {
        isCorrect = (selectedGuess === 'higher')
          ? (selectedIndustry.dataValue >= startingIndustry.dataValue)
          : (selectedIndustry.dataValue <= startingIndustry.dataValue)
      } else {
        isCorrect = (selectedGuess === 'higher')
          ? (selectedIndustry.dataValue >= previousIndustry.dataValue)
          : (selectedIndustry.dataValue <= previousIndustry.dataValue)
      }
    };

    updateCardState(selectedCard, 'Flipping');

    setTimeout(() => {
      updateCardState(selectedCard, 'Flipped');
    }, 600); // Duration of the flip animation

    if (isCorrect) {
      setScore(prevScore => prevScore + 1); // Increment score correctly using functional update
      // console.log('Correct Guess! New Previous Industry:', selectedIndustry); // Add console log
    } else {
      setLives(prevLives => {
        const newLives = prevLives - 1;
        if (newLives === 0) {
          setTimeout(() => {
            setGameStatus('lost'); // Set game status to lost if no lives left
            console.error('Game Over! No lives left.');
          }, 2000); // 3-second delay before winning
        }
        return newLives; // Return updated lives
      });
    }

    setGuess(null); // Reset guess
    setPreviousIndustry(selectedIndustry); // Set selected industry as previous industry
    setSelectedCard(null); // Reset selected card
    setRoundCounter(prevRoundCounter => prevRoundCounter + 1); // Increment round counter correctly
  };

  // UseEffect to check if game is won or rounds are completed
  useEffect(() => {
    if (roundCounter >= 9) {
      setTimeout(() => {
        setGameStatus('won');
        // console.log('Congratulations! You have won the game!');
      }, 2000); // 3-second delay before winning
    }
  }, [roundCounter]); // Add dependency array to run effect only when roundCounter changes

  // Card component
  const Card = ({ industry, onClick }) => (
    <div className='card' onClick={onClick}>
      <div className={`card-inner ${industry.state === 'Selected' ? 'selected' : ''} ${industry.state === 'Flipping' ? 'flipping' : ''} ${industry.state === 'Flipped' ? 'flipped' : ''}`}>
        <div className={`card-front ${industry.state === 'Selected' ? 'selected' : ''}`}>
          <p>{`${industry.name ? industry.name : ""} ${industry.state === 'Flipped' && industry.dataValue ? ` ${industry.dataValue}Bn` : ""}`}</p>
        </div>
        <div className="card-back">
          <p>{`${industry.name ? industry.name : ""} ${industry.state === 'Flipped' && industry.dataValue ? ` ${industry.dataValue}Bn` : ""}`}</p>
        </div>
      </div>
    </div>
  );

  // Win Status
  if (gameStatus === 'won') {
    return (
      <div className="win-screen">
        <Win score={score} livesRemaining={lives} round={roundCounter} />
        <CTAGuessAutomotive />
      </div>
    );
  }

  // Lose Status
  if (gameStatus === 'lost') {
    return (
      <div className="lose-screen">
        <Lose score={score} livesRemaining={lives} round={roundCounter} />
        <CTAGuessAutomotive />
        <div className="restart">
          <button onClick={restartGame}>Restart</button>
        </div>
      </div>
    );
  }

  // Game Board
  return (
    <div className="game-board">
      <div className="instructions" >
        <p style={{ fontWeight: 'bold' }}>Instructions: </p>
        <ul>
          <li>Select a card and predict it's value will be higher or lower than the starting industry</li>
          <li>If you guess correctly, you will earn a point.</li>
          <li>If you guess incorrectly, you will lose a life.</li>
          <li>In the next round: choose another card and predict if it's value will be higher or lower than the previous industry.</li>
          <li>The game ends when you have no lives left or you reach 9 points.</li>
        </ul>
      </div>
      <div className="game-controls">



        <div className="game-info">
          {/* Starting Industry */}
          {roundCounter === 0 && (
            <div className="game-info-item" id="starting-industry">
              <div className="label"><p>Starting Industry:</p></ div>

              <p>{startingIndustry?.name} (£{startingIndustry?.dataValue}bn)</p>

            </div>
          )}

          {/* Previous Industry */}
          {previousIndustry?.name !== startingIndustry?.name && (
            <div className="game-info-item" id="previous-industry">
              <div className="label"><p>Previous Industry:</p></ div>

              <p>{previousIndustry?.name} (£{previousIndustry?.dataValue}bn)</p>

            </div>
          )}

          {/* Lives */}
          <div className="game-info-item">
            <div className="label"><p>Lives:</p></ div>
            <div className="value-box">
              {Array.from({ length: lives }).map((_, index) => (
                <span key={index} className="heart">❤️</span>
              ))}
            </div>
          </div>



          {/* Score */}
          <div className="game-info-item">
            <div className="label"><p>Score:</p></ div>
            <div className="value-box">
              <p>{score}</p>
            </div>
          </div>

          {/* Round Counter */}
          <div className="game-info-item">
            <div className="label"><p>Round:</p></ div>
            <div className="value-box">
              <p>{roundCounter}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {cards.map((industry, index) => (
          <Card
            key={index}
            industry={industry}
            onClick={() => handleCardSelection(index)}
          />
        ))}
      </div>

      <div className="game-controls">
        <div className="buttons">
          <button id="Lower-Button" onClick={() => handleGuess('lower')} disabled={selectedCard === null}>Lower</button>
          <button id="Higher-Button" onClick={() => handleGuess('higher')} disabled={selectedCard === null}>Higher</button>
        </div>
      </div>

      {/* Restart Button */}
      <div className="restart">
        <button onClick={restartGame}>Restart</button>
      </div>
    </div>
  );
};

export default GameBoard;