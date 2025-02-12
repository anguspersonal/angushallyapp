import React, { useCallback, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // ✅ Remove BrowserRouter here
import "./index.css";
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Blog from "./pages/Blog.jsx";
import Projects from "./pages/Projects.jsx";
import EatSafeUK from "./pages/projectPages/EatSafeUK/EatSafeUK.jsx";
import DataValueGame from "./pages/projectPages/DataValueGame/DataValueGame.jsx";
import Blogpost from "./pages/projectPages/Blog/BlogPost.jsx";
import Strava from "./pages/projectPages/Strava/Strava.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";

function App() {
  // Set Use States
  const [message, setMessage] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [url, setUrl] = useState("/api");
  const location = useLocation(); // ✅ Now this works properly

  // Define routes where the footer should be hidden
  const hideFooterRoutes = ["/projects/DataValueGame"];

  // Set initial App data
  const fetchData = useCallback(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`status ${response.status}`);
        }
        return response.json();
      })
      .then((json) => {
        setMessage(json.message);
        setIsFetching(false);
      })
      .catch((e) => {
        setMessage(`API call failed: ${e}`);
        setIsFetching(false);
      });
  }, [url]);

  // Use Effect to fetch data
  useEffect(() => {
    setIsFetching(true);
    fetchData();
  }, [fetchData]);

  // Return the App UI
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<Blogpost />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/projects/EatSafeUK" element={<EatSafeUK />} />
        <Route path="/projects/DataValueGame" element={<DataValueGame />} />
        <Route path="/projects/Strava" element={<Strava />} />
      </Routes>
      {/* Conditionally render the footer only if the current route is NOT in hideFooterRoutes */}
      {!hideFooterRoutes.includes(location.pathname) && <Footer />}
    </div>
  );
}

export default App;
