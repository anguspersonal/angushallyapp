/**
 * Data Value Game
 * 
 */

import React, { useState, useDebugValue } from 'react'
import GameBoard from './Gameboard';
import Welcome from './Welcome';
import DVGHeader from './DVGHeader';
import DVGFooter from './DVGFooter';


//UseLabelState hook to add labels to state values
const useLabeledState = (initialState, label) => {
    const [state, setState] = useState(initialState);
    useDebugValue(`${label}: ${state}`);
    return [state, setState];
};



//DataValueGame component
function DataValueGame() {

    const [gameStatus, setGameStatus] = useLabeledState(false, 'Game Status'); //State to control whether the game is playing or not



    return (
        <div className='dvg'>
            <DVGHeader />
            {/* Display the game board only if the game is playing */}
            {gameStatus ?
                <GameBoard gameStatus={gameStatus} /> :
                <Welcome startGame={() => setGameStatus(true)} />
            }
             <DVGFooter />
        </div>)
};

export default DataValueGame;