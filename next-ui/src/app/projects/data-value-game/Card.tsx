import React from 'react';
import './Card.css';

interface Industry {
    name: string;
    dataValue: number;
}

interface CardProps {
    industry: Industry;
    onClick: () => void;
    flipped: boolean;
    disabled: boolean;
    selected: boolean;
}

const Card: React.FC<CardProps> = ({ industry, onClick, flipped, disabled, selected }) => {
  return (
    <div className={`card ${selected ? 'selected' : ''}`} onClick={disabled ? undefined : onClick}>
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        <div className="card-front">
          <p>{`${industry.name} ${flipped ? `£${industry.dataValue}` : ''}bn`}</p>
        </div>
      </div>
    </div>
  );
};

export default Card; 