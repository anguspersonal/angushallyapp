import React, { useState } from 'react';
import {
    Box,
    Container,
    Title,
    TextInput,
    Textarea,
    Button,
    Text,
    Group,
    Stack
} from '@mantine/core';
import { useForm } from '@mantine/form';
import ReCAPTCHA from "react-google-recaptcha";
import { motion } from 'framer-motion';
import Header from '../components/Header';
import "../general.css";

// Animation variants for staggered fade-in
const formElementVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1, // Stagger delay
            duration: 0.5,
            ease: "easeOut"
        }
    })
};

function Contact() {
    const [captchaValue, setCaptchaValue] = useState(null);
    const [status, setStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state for button

    const form = useForm({
        initialValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
        // Optional: Add validation
        validate: {
            name: (value) => (value.trim().length < 2 ? 'Name must have at least 2 letters' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            subject: (value) => (value.trim().length === 0 ? 'Subject cannot be empty' : null),
            message: (value) => (value.trim().length < 10 ? 'Message must be at least 10 characters long' : null),
        },
    });

    const handleSubmit = async (values) => {
        if (!captchaValue) {
            setStatus("Please complete the CAPTCHA.");
            form.setFieldError('captcha', 'Please complete the CAPTCHA.'); // Optional: set form error
            return;
        }

        setStatus("Sending...");
        setIsSubmitting(true);
        try {
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...values, captcha: captchaValue }),
            });

            const result = await response.json();
            if (response.ok) {
                setStatus("Message sent successfully! Thanks for reaching out.");
                form.reset();
                setCaptchaValue(null);
                // Consider resetting the ReCAPTCHA component visually if possible/needed
            } else {
                setStatus(result.error || "Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error("Contact form error:", error); // Log error for debugging
            setStatus("An error occurred. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Box>
            <Header />
            <Container size="sm" py="xl">
                <motion.div initial="hidden" animate="visible"> {/* Parent for stagger */}
                    <motion.div custom={0} variants={formElementVariants}>
                        <Title order={2} mb="xl" ta="center">Get In Touch</Title>
                    </motion.div>

                    <Box component="form" onSubmit={form.onSubmit(handleSubmit)} align="left">
                        <Stack gap="md">
                            <motion.div custom={1} variants={formElementVariants}>
                                <TextInput
                                    required
                                    label="Name"
                                    placeholder="Your name"
                                    {...form.getInputProps('name')}
                                    styles={{ label: { textAlign: 'left' } }}
                                />
                            </motion.div>

                            <motion.div custom={2} variants={formElementVariants}>
                                <TextInput
                                    required
                                    label="Email"
                                    placeholder="your@email.com"
                                    {...form.getInputProps('email')}
                                    styles={{ label: { textAlign: 'left' } }}
                                />
                            </motion.div>

                            <motion.div custom={3} variants={formElementVariants}>
                                <TextInput
                                    required
                                    label="Subject"
                                    placeholder="What's this about?"
                                    {...form.getInputProps('subject')}
                                    styles={{ label: { textAlign: 'left' } }}
                                />
                            </motion.div>

                            <motion.div custom={4} variants={formElementVariants}>
                                <Textarea
                                    required
                                    label="Message"
                                    placeholder="Your message..."
                                    minRows={4}
                                    {...form.getInputProps('message')}
                                    styles={{ label: { textAlign: 'left' } }}
                                />
                            </motion.div>

                            <motion.div custom={5} variants={formElementVariants}>
                                <Group justify="center" mt="md">
                                    <ReCAPTCHA
                                        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY_HERE"} // Add fallback for safety
                                        onChange={(value) => setCaptchaValue(value)}
                                        // Add theme='dark' prop if needed based on your theme
                                    />
                                </Group>
                                {/* Display CAPTCHA error if any */}
                                {form.errors.captcha && (
                                    <Text c="red" size="sm" ta="center" mt="xs">{form.errors.captcha}</Text>
                                )}
                            </motion.div>

                            <motion.div custom={6} variants={formElementVariants}>
                                <Group justify="center" mt="xl">
                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        gradient={{ from: 'teal', to: 'blue' }}
                                        size="md"
                                        loading={isSubmitting} // Show loading state
                                    >
                                        Send Message
                                    </Button>
                                </Group>
                            </motion.div>

                            {status && (
                                <motion.div custom={7} variants={formElementVariants}>
                                    <Text ta="center" mt="md" c={status.includes("successfully") ? 'green' : status.includes("Failed") || status.includes("error") || status.includes("Please complete") ? 'red' : 'dimmed'}>
                                        {status}
                                    </Text>
                                </motion.div>
                            )}
                        </Stack>
                    </Box>
                </motion.div>
            </Container>
        </Box>
    );
}

export default Contact;