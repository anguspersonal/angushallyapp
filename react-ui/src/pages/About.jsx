import React from 'react';
import '../index.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

function About() {
    return (
        <div className='Page'>
            <Header />
            <div className='full_stage'>
                <div className='centre_stage'>
                    <h2>Hi, I'm Angus</h2>
                    <div className='photoWrapper'><img src="../angusprofile.jpg" alt="Angus Hally" id='profilePhoto' /></div>
                    <p>I'm a strategy consultant and amateur developer with a passion for the intersection of
                        <strong> business strategy,</strong> software, and data.
                    </p>

                    <p>I started my career at
                        <a href="https://www.accenture.com/gb-en" target="_blank" rel="noopener noreferrer"> Accenture</a>,
                        cutting my teeth as an analyst in digital transformation projects across the
                        <a href="https://www.royalnavy.mod.uk/" target="_blank" rel="noopener noreferrer"> Royal Navy</a>,
                        <a href="https://www.sussex-pcc.gov.uk/pcc-priorities/partnership-working/video-enabled-justice-vej/" target="_blank" rel="noopener noreferrer"> Police</a>, and
                        <a href="https://www.judiciary.uk/" target="_blank" rel="noopener noreferrer"> Courts and Tribunals Judiciary (CTJ)</a>.
                        Later, I moved into Accenture’s <strong>strategy division</strong>, working on
                        <strong> pricing, GDPR, and data-driven insights</strong> in large telecom and insurance companies.
                    </p>

                    <p>Before all that, I was a <strong>mathematics teacher</strong> through the
                        <a href="https://www.teachfirst.org.uk/" target="_blank" rel="noopener noreferrer"> TeachFirst program</a>—to this day, the hardest thing I've done.
                    </p>

                    <p>Currently, I work as a <strong>Data Strategy Manager at
                        <a href="https://www.anmut.co.uk/" target="_blank" rel="noopener noreferrer"> Anmut</a></strong>,
                        a data management consultancy shaking up the industry with its
                        <a href="https://www.anmut.co.uk/solutions/data-valuation/" target="_blank" rel="noopener noreferrer"> data valuation service</a> and
                        cutting-edge data maturity tools, like <a href="https://www.anmut.co.uk/solutions/data-maturity/" target="_blank" rel="noopener noreferrer">Grace</a>.
                    </p>

                    <p>This website is my<strong> sandbox</strong>—a space to explore <strong> personal software projects</strong> and challenge myself to put what I learn and my thoughts out into the world.
                        Honestly, I find that terrifying. But growth comes from pushing past discomfort, and I believe the best way to develop is to
                        <strong> create, share, and learn from others</strong>.
                    </p>

                    <p>If you have any thoughts, feedback, or just want to chat, feel free to reach out via the
                        <Link to="/contact"> Contact Me</Link> page.
                    </p>

                    <p><strong>Thanks for stopping by—I appreciate it!</strong></p>

                    {/*<!-- Social Links -->*/}
                    <div class="social-links">
                        <a href="https://www.linkedin.com/in/angus-hally-9ab66a87" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-linkedin"></i>
                        </a>
                        <a href="https://github.com/anguspersonal" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-github"></i>
                        </a>
                        <a href="https://x.com/HallyAngus" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-twitter"></i>
                        </a>
                        <a href="https://www.instagram.com/hallyangus/" target="_blank" rel="noopener noreferrer">
                            <i class="fab fa-instagram"></i>
                        </a>
                    </div>


                </div>
            </div>
        </div>
    );
}

export default About;