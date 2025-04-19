import React, { useCallback, useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom"; // ✅ Remove BrowserRouter here
import "./index.css";
import "./general.css"; // Ensure general.css is imported
import Home from "./pages/Home.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import Blog from "./pages/Blog.jsx";
import Projects from "./pages/Projects.jsx";
import EatSafeUK from "./pages/projects/eat-safe-uk/EatSafeUK.jsx";
import DataValueGame from "./pages/projects/data-value-game/DataValueGame.jsx";
import Blogpost from "./pages/projects/blog/BlogPost.jsx";
import Strava from "./pages/projects/strava/Strava.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Habit from "./pages/projects/habit/Habit.jsx";
import Collab from "./pages/Collab.jsx";
import { MantineProvider } from '@mantine/core'; // Import MantineProvider
import { theme } from './theme.js'; // Import your theme

function App() {
  const location = useLocation(); // ✅ Now this works properly

  // Define routes where the footer should be hidden
  const hideFooterRoutes = ["/projects/data-value-game"];

  // Return the App UI
  return (
    <MantineProvider theme={theme}> {/* Wrap everything in MantineProvider */}
      <div className="App"> {/* Keep your main App div if needed for structure */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<Blogpost />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/collab" element={<Collab />} />
          <Route path="/projects/eat-safe-uk" element={<EatSafeUK />} />
          <Route path="/projects/data-value-game" element={<DataValueGame />} />
          <Route path="/projects/strava" element={<Strava />} />
          <Route path="/projects/habit" element={<Habit />} />
        </Routes>
        {/* Conditionally render the footer only if the current route is NOT in hideFooterRoutes */}
        {!hideFooterRoutes.includes(location.pathname) && <Footer />}
      </div>
    </MantineProvider>
  );
}

export default App;
