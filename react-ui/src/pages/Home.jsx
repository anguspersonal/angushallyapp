import React, { useState, useEffect } from 'react';
import '../index.css';
import "../general.css";
import Header from '../components/Header';
import Snippet from '../components/Snippet';
import { fetchLatestBlog } from '../pages/projectPages/Blog/fetchBlogData';
import getProjectList from '../pages/projectPages/projectList';
import ProjectSnippet from '../pages/projectPages/ProjectSnippet';
import { Link } from 'react-router-dom';


function Home() {
  const [latestBlog, setBlog] = useState(null);
  const [latestProject, setProject] = useState(null);

  //fetch latest blog
  useEffect(() => {
    async function getLatestblog() {
      const latestBlog = await fetchLatestBlog();
      setBlog(latestBlog);
    };
    getLatestblog();

  }, []);

  // fetch latest project
  useEffect(() => {
    async function getLatestProject() {
      try {
        // Get the project list (already a JSON array)
        const projects = getProjectList();

        // Sort projects by `created_at` (latest first)
        const latestProject = projects
          .filter(p => p.created_at) // Ensure no null/undefined dates
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

        // console.log("Latest Project:", latestProject);

        setProject(latestProject);
      } catch (error) {
        console.error("❌ Error fetching latest project:", error);
        return null;
      }

    };
    getLatestProject();


  }, []);

  return (
    <div className='Page'>
      <Header />
      <div className='full_stage'>
        <div className='centre_stage'>
          <div className='photoWrapper'><img src="../angusprofile.jpg" alt="Angus Hally" id='profilePhoto' /></div>
          <h1>Welcome to My Website</h1>
          <p>
            👋 Hi, I'm Angus. I'm a strategy consultant, amateur developer, and constant learner.
            This site is a mix of personal projects, career experiments and things
            I've learned by building, shipping, and sometimes failing.
            <br></br>
            <br></br>
            I'm also open to collaborating with early-stage founders; helping take raw ideas toward traction, funding, and real-world impact.
            <br></br>
            <br></br>
            Feel free to explore, poke around, and say hello via the<Link to="/contact"> contact me</Link> page!
          </p>
          <div className="grid-container">
            {latestBlog && <Snippet {...latestBlog} />}
            {latestProject && <ProjectSnippet project={latestProject} />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
