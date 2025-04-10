import React, { useState } from 'react';
import '../index.css';
import "../general.css";
import Header from '../components/Header';
import ReCAPTCHA from "react-google-recaptcha";

function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
        captchaValue: null,
    });
    const [captchaValue, setCaptchaValue] = useState(null); // Store CAPTCHA value
    const [status, setStatus] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        // Check if CAPTCHA is completed
        if (!captchaValue) {
            setStatus("Please complete the CAPTCHA");
            return;
        }
    
        setStatus("Sending...");
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, captcha: captchaValue }), // ✅ Include captcha
            });
    
            const result = await response.json();
            if (response.ok) {
                setStatus("Message sent successfully!");
                setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
                setCaptchaValue(null); // Reset CAPTCHA
            } else {
                setStatus(result.error || "Failed to send message.");
            }
        } catch (error) {
            setStatus("An error occurred. Please try again.");
        }
    };
    

    return (
        <div className='Page'>
            <Header />
            <h1>Contact</h1>
            <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="subject">Subject:</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="message">Message:</label>
                    <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />
                </div>

                {/* reCAPTCHA Component */}
                <ReCAPTCHA
                    sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                    onChange={(value) => setCaptchaValue(value)}
                />

                <button type="submit">Send Message</button>
                <p>{status}</p>
            </form>
        </div>
    );
}

export default Contact;