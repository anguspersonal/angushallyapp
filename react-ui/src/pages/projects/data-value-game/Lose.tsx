import React, {useEffect} from 'react';
import './Gameboard.css';

interface LoseProps {
    score: number;
    livesRemaining: number;
    round: number;
}

const Lose: React.FC<LoseProps> = ({ score, livesRemaining, round }) => {

    useEffect(() => {
        // Scroll to top when the component renders
        window.scrollTo(0, 0);
      }, []);



    return (
        <div className="lose-screen">
            <h1 id="loseScreenTitle">Game Over</h1>
            <p>Sorry, you lost the game. Better luck next time!</p>
            <p>Final Score: {score}</p>
            <p>Lives Remaining: {livesRemaining}</p>
            <p>Final Round: {round}</p>
        </div>
    );
};

export default Lose;