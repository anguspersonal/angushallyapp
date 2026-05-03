'use client';

import React, { useState, useDebugValue } from 'react';
import dynamic from 'next/dynamic';
import Welcome from './Welcome';
import DVGHeader from './DVGHeader';
import DVGFooter from './DVGFooter';

const GameBoard = dynamic(() => import('./Gameboard'), {
  ssr: false,
  loading: () => <div className="dvg" style={{ minHeight: '60vh' }} />,
});

// UseLabelState hook to add labels to state values
function useLabeledState<T>(initialState: T, label: string): [T, React.Dispatch<React.SetStateAction<T>>] {
    const [state, setState] = useState<T>(initialState);
    useDebugValue(`${label}: ${state}`);
    return [state, setState];
}

// DataValueGame component
export default function DataValueGamePage() {
    const [gameStatus, setGameStatus] = useLabeledState<boolean>(false, 'Game Status'); // State to control whether the game is playing or not

    return (
        <div className='dvg'>
            <DVGHeader />
            {/* Display the game board only if the game is playing */}
            {gameStatus ?
                <GameBoard gameStatus={gameStatus} /> :
                <Welcome startGame={() => setGameStatus(true)} />
            }
            <DVGFooter />
        </div>
    );
} 