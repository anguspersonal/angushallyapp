// @ts-nocheck
import React, { useState, useDebugValue } from 'react';
import './Card.css'; // Ensure the correct path to the CSS file

const Card = ({ industry, onClick, flipped, disabled, selected }) => {
  return (
    <div className={`card ${selected ? 'selected' : ''}`} onClick={disabled ? null : onClick}>
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        <div className="card-front">
          <p>{`${industry.name} ${flipped ? `£${industry.dataValue}` : ''}bn`}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;