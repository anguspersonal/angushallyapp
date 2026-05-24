---
source: /contact
topic: Contact form
priority: normal
---

> Source: `/contact`

The contact page has a reCAPTCHA-protected form with four fields: name,
email, subject, message. Submissions email Angus directly and store the
inquiry in the site's CRM schema.

This is the **primary entry point for any external outreach** —
investor chats, collaboration, advisor pitches, hiring conversations,
maths-tutoring enquiries.

The chatbot can draft a contact-form message and pre-fill the form on
the user's behalf via the `draft_contact_message` tool. The user
always reviews and submits manually — the bot does not send messages.

If reCAPTCHA is misconfigured, the page surfaces a direct fallback
email: angus.hally@gmail.com.
