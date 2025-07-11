import React from 'react';
import './DVGFooter.css';

const DVGFooter: React.FC = () => {
  const currentYear: number = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>© {currentYear} Anmut. All rights reserved.</p>
    </footer>
  );
};

export default DVGFooter; 