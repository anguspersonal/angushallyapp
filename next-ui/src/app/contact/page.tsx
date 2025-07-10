'use client';

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
import { motion, Variants } from 'framer-motion';
import { api } from '@/shared/apiClient';

// Animation variants for staggered fade-in
const formElementVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: i * 0.1, // Stagger delay
            duration: 0.5
        }
    })
};

interface ContactFormValues {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [captchaValue, setCaptchaValue] = useState<string | null>(null);
    const [status, setStatus] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<ContactFormValues>({
        initialValues: {
            name: "",
            email: "",
            subject: "",
            message: "",
        },
        validate: {
            name: (value: string) => (value.trim().length < 2 ? 'Name must have at least 2 letters' : null),
            email: (value: string) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
            subject: (value: string) => (value.trim().length === 0 ? 'Subject cannot be empty' : null),
            message: (value: string) => (value.trim().length < 10 ? 'Message must be at least 10 characters long' : null),
        },
    });

    const handleSubmit = async (values: ContactFormValues) => {
        if (!captchaValue) {
            setStatus("Please complete the CAPTCHA.");
            form.setFieldError('captcha', 'Please complete the CAPTCHA.');
            return;
        }

        setStatus("Sending...");
        setIsSubmitting(true);
        try {
            const result = await api.post('/contact', { ...values, recaptchaToken: captchaValue });
            setStatus("Message sent successfully! Thanks for reaching out.");
            form.reset();
            setCaptchaValue(null);
        } catch (error) {
            console.error("Contact form error:", error);
            setStatus("An error occurred. Please check your connection and try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container size="sm" py="xl">
            <motion.div initial="hidden" animate="visible">
                <motion.div custom={0} variants={formElementVariants}>
                    <Title order={2} mb="xl" ta="center">Get In Touch</Title>
                </motion.div>

                <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
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
                                    sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY_HERE"}
                                    onChange={(value: string | null) => setCaptchaValue(value)}
                                />
                            </Group>
                            {form.errors.captcha && (
                                <Text c="dark" size="sm" ta="center" mt="xs">{form.errors.captcha}</Text>
                            )}
                        </motion.div>

                        <motion.div custom={6} variants={formElementVariants}>
                            <Group justify="center" mt="xl">
                                <Button
                                    type="submit"
                                    variant="gradient"
                                    gradient={{ from: 'teal', to: 'blue' }}
                                    size="md"
                                    loading={isSubmitting}
                                >
                                    Send Message
                                </Button>
                            </Group>
                        </motion.div>

                        {status && (
                            <motion.div custom={7} variants={formElementVariants}>
                                <Text 
                                    ta="center" 
                                    mt="md" 
                                    c={status.includes("successfully") ? 'success' : status.includes("Failed") || status.includes("error") || status.includes("Please complete") ? 'dark' : 'secondary'}
                                >
                                    {status}
                                </Text>
                            </motion.div>
                        )}
                    </Stack>
                </Box>
            </motion.div>
        </Container>
    );
} 