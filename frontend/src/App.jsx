


import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
// import Blog from './pages/Blog';   // Create Blog.jsx later
// import Portfolio from './pages/Portfolio'; // Create Portfolio.jsx later

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* <Route path="/blog" element={<Blog />} />
        <Route path="/portfolio" element={<Portfolio />} /> */}
      </Routes>
    </Router>
  );
};

export default App;

// </div>
// <h1>Boilerplate</h1>
// <div className="card">
//   <button onClick={() => setCount((count) => count + 1)}>
//     count is {count}
//   </button>
// </div>