// App.js
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
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
import Blogpost from "./pages/blog/BlogPost.jsx";
import Strava from "./pages/projects/strava/Strava.jsx";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Habit from "./pages/projects/habit/Habit.jsx";
import AIProjects from "./pages/projects/ai/AIProjects.jsx";
import TextAnalysisAI from "./pages/projects/ai/TextAnalysisAI.jsx";
import Instapaper from "./pages/projects/ai/Instapaper.jsx";
import Collab from "./pages/Collab.jsx";
import Login from "./pages/Login.jsx";
import Raindrop from "./pages/projects/bookmarks/raindrop.jsx";
import SoftwareCV from "./pages/SoftwareCV.jsx";
import { MantineProvider } from '@mantine/core'; // Import MantineProvider
import { theme } from './theme.js'; // Import your theme
import { AuthProvider } from './contexts/AuthContext.jsx';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const location = useLocation();
  const hideFooterRoutes = ["/projects/data-value-game"];

  return (
    <MantineProvider theme={theme}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <AuthProvider>
          <div className="App">
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
              <Route path="/projects/ai" element={<AIProjects />} />
              <Route path="/projects/ai/text-analysis" element={<TextAnalysisAI />} />
              <Route path="/projects/ai/instapaper" element={<Instapaper />} />
              <Route path="/projects/bookmarks/raindrop" element={<Raindrop />} />
              <Route path="/login" element={<Login />} />
              <Route path="/cv" element={<SoftwareCV />} />
            </Routes>
            {!hideFooterRoutes.includes(location.pathname) && <Footer />}
          </div>
        </AuthProvider>
      </GoogleOAuthProvider>
    </MantineProvider>
  );
}

export default App;
