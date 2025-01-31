import React, { useCallback, useEffect, useState } from 'react';
// import logo from './logo.svg';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/Footer';
import Header from './components/Header';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import Projects from './pages/Projects';
import EatSafeUK from './pages/projectPages/EatSafeUK/EatSafeUK';
import DataValueGame from './pages/projectPages/DataValueGame/DataValueGame';
import Blogpost from './pages/projectPages/Blog/BlogPost';

function App() {
  //Set Use States  
  const [message, setMessage] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [url, setUrl] = useState('/api');

  //Set initial App data
  const fetchData = useCallback(() => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then(json => {
        setMessage(json.message);
        setIsFetching(false);
      }).catch(e => {
        setMessage(`API call failed: ${e}`);
        setIsFetching(false);
      })
  }, [url]);

  //Use Effect to fetch data
  useEffect(() => {
    setIsFetching(true);
    fetchData();
  }, [fetchData]);

  //Return the App UI
  return (
      <Router>
        <div className="App">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element= {<Blog/>} />
              <Route path='/blog/:slug' element={<Blogpost />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/projects/EatSafeUK" element={<EatSafeUK />} />
              <Route path="/projects/DataValueGame" element={<DataValueGame />} />
            </Routes>
    </div>
    </Router>
  );

}

export default App;


