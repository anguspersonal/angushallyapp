import React from "react";

interface WelcomeProps {
    startGame: () => void;
}

const Welcome: React.FC<WelcomeProps> = ({ startGame }) => {
    return (
        <div>
            <h1>Welcome to the Data Value Game</h1>
            <p>Click the button below to start the game</p>
            <button onClick={startGame}>Start Game</button>
        </div>
    );
};

export default Welcome; 