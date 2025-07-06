import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./index.css";
import "./general.css"; // Ensure general.css is imported
import Home from "./pages/Home";
import Footer from "./components/Footer";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Projects from "./pages/Projects";
import EatSafeUK from "./pages/projects/eat-safe-uk/EatSafeUK";
import DataValueGame from "./pages/projects/data-value-game/DataValueGame";
import Blogpost from "./pages/blog/BlogPost";
import Strava from "./pages/projects/strava/Strava";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Habit from "./pages/projects/habit/Habit";
import AIProjects from "./pages/projects/ai/AIProjects";
import TextAnalysisAI from "./pages/projects/ai/TextAnalysisAI";
import Instapaper from "./pages/projects/ai/Instapaper";
import Collab from "./pages/Collab";
import Login from "./pages/Login";
import Raindrops from "./pages/projects/bookmarks/Raindrops";
import Bookmarks from "./pages/projects/bookmarks/Bookmarks";
import ShareHandler from "./pages/projects/bookmarks/ShareHandler";
import SoftwareCV from "./pages/SoftwareCV";
import { MantineProvider } from '@mantine/core'; // Import MantineProvider
import { theme } from './theme'; // Import your theme
import { AuthProvider } from './contexts/AuthContext.tsx';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  const location = useLocation();
  const hideFooterRoutes = ["/projects/data-value-game"];

  return (
    <MantineProvider theme={theme}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || ''}>
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
              <Route path="/projects/bookmarks" element={<Bookmarks />} />
              <Route path="/projects/bookmarks/raindrop" element={<Raindrops />} />
              <Route path="/share" element={<ShareHandler />} />
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