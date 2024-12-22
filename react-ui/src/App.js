import React, { useCallback, useEffect, useState } from 'react';
// import logo from './logo.svg';
import './App.css';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Footer from './components/Footer';
import Header from './components/Header';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import Projects from './pages/Projects';

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
          <Header />
          
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
            </Routes>
      <Footer />
    </div>
    </Router>
  );

}

export default App;

/* Boilerplate code from create-react-app 

<header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>Angus App</h1>
        <p>{'« '}<strong>
          {isFetching
            ? 'Fetching message from API'
            : message}
        </strong>{' »'}</p>
      </header>
*/
