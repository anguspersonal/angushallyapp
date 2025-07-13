import React from 'react';
import { IconBulb, IconRocket, IconChartBar, IconUsers, IconShieldLock, IconHammer } from '@tabler/icons-react';

export interface CaseStudyImage {
    src: string;
    alt: string;
    attribution: string;
    attributionLink: string;
}

export interface CaseStudy {
    id: number;
    type: 'caseStudy';
    image: CaseStudyImage;
    icon: React.ReactElement;
    title: string;
    tags: string[];
    challenge: string;
    solution: string;
    outcome: string;
    blogPostSlug: string;
}

export const caseStudies: CaseStudy[] = [
    {
        id: 0,
        type: 'caseStudy',
        image: {
            src: "/josh-calabrese-Ev1XqeVL2wI-unsplash.jpg",
            alt: "Rowers on a river, ariel view, working together in a team",
            attribution: "Photo by Josh Calabrese",
            attributionLink: "https://unsplash.com/@joshcala?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        },
        icon: <IconBulb size={24} />,
        title: "Future Factory Pivot to Teamvine",
        tags: ["startup", "grant funding", "product strategy"],
        challenge: "Pivoting from physical team-building kits to an online platform with no technical founder or external funding.",
        solution: "Secured a £100k Innovate UK grant, built the MVP with part-time developers, and launched the first digital product.",
        outcome: "Established Teamvine as a digital-first company and validated the new business model through early traction.",
        blogPostSlug: "/blog/future-factory-digital-pivot"
    },
    {
        id: 1,
        type: 'caseStudy',
        image: {
            src: "/george-ciobra-2sT4RAAzOj4-unsplash.jpg",
            alt: "The Royal Courts of Justice, London",
            attribution: "Photo by George Ciobra",
            attributionLink: "https://unsplash.com/@george_ciobra?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        },
        icon: <IconRocket size={24} />,
        title: "COVID Rollout – Remote Justice Enablement",
        tags: ["public sector", "covid response", "delivery leadership"],
        challenge: "Hundreds of legal staff needed access to remote court systems during lockdown, but onboarding was slow and unscalable.",
        solution: "Redesigned the onboarding process, managed a team of analysts, and scaled onboarding from 2 to 30 users/day.",
        outcome: "Enabled 500+ legal professionals across 5 agencies to access court remotely, keeping justice moving during lockdown.",
        blogPostSlug: "/blog/vej-pandemic-rollout"
    },
    {
        id: 2,
        type: 'caseStudy',
        image: {
            src: "/jorge-salvador-c6hEUfgiwnw-unsplash.jpg",
            alt: "Tasajera, Aragua, Venezuela, April 23, 2020, aerial antenna in mountains",
            attribution: "Photo by Jorge Salvador",
            attributionLink: "https://unsplash.com/@jsshotz?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        },
        icon: <IconChartBar size={24} />,
        title: "£4M Commercial Insight (Telecoms)",
        tags: ["data analysis", "customer segmentation", "enterprise"],
        challenge: "Client lacked a behaviour-based view of customers, limiting upsell opportunities across thousands of tariffs.",
        solution: "Developed four models using product usage data and cluster analysis to identify micro-segments.",
        outcome: "Identified £12.3M in opportunity; £4M uplift realised through revised sales targeting within a year.",
        blogPostSlug: "/blog/commercial-usage-insight"
    },
    {
        id: 3,
        type: 'caseStudy',
        image: {
            src: "/ani-adigyozalyan-ILw49SKUe8M-unsplash.jpg",
            alt: "Cat cunningly hiding in a brown paper bag, the expert secret shopper",
            attribution: "Photo by Ani Adigyozalyan",
            attributionLink: "https://unsplash.com/@aniadigyozalyan?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        },
        icon: <IconUsers size={24} />,
        title: "Retail Journey Uplift – Secret Shopper Insight",
        tags: ["cx design", "conversion", "retail"],
        challenge: "Retail stores failed to capture consent from walkouts, limiting follow-up and conversion.",
        solution: "Performed secret shopper visits, identified the gap, and led a redesign of the customer journey.",
        outcome: "Proposed changes projected to increase revenue by £1.1M–£3.5M annually through re-engagement.",
        blogPostSlug: "/blog/retail-journey-insight"
    },
    {
        id: 4,
        type: 'caseStudy',
        image: {
            src: "/rick-oldland-BVaGEkvF2LU-unsplash.jpg",
            alt: "POV view of motorcylist rather to drive down a winding road through a beautiful valley. Lake District National Park, Ambleside, United Kingdom, Published on November 14, 2020. Apple, iPhone X",
            attribution: "Photo by Rick Oldland",
            attributionLink: "https://unsplash.com/@myhopelives?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        },
        icon: <IconShieldLock size={24} />,
        title: "DVSA Data Valuation & Strategy",
        tags: ["data strategy", "public sector", "valuation"],
        challenge: "DVSA held extensive datasets but lacked a strategy to prioritise data investment.",
        solution: "Led a valuation project to assess financial and strategic impact of data assets.",
        outcome: "Delivered a framework used to guide strategic data funding and investment prioritisation.",
        blogPostSlug: "/blog/dvsa-data-valuation"
    },
    {
        id: 5,
        type: 'caseStudy',
        image: {
            src: "/conny-schneider-xuTJZ7uD7PI-unsplash.jpg",
            alt: "A blue backgournd with lines and circles representing data points. Hamburg, Deutschland. Published on February 5, 2022",
            attribution: "Photo by Conny Schneider",
            attributionLink: "https://unsplash.com/@choys_?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash"
        },
        icon: <IconHammer size={24} />,
        title: "Marketing Consent & Data Strategy (Telecom)",
        tags: ["gdpr", "data governance", "revenue modelling"],
        challenge: "Conflicting customer preferences across systems made many contacts unmarketable, limiting revenue.",
        solution: "Modelled uplift from unifying identity and consent data; built a £2.7M–£4.5M p.a. business case for centralisation.",
        outcome: "Influenced data roadmap; became a go-to for privacy strategy among MDs and data leads.",
        blogPostSlug: "/blog/telecom-gdpr-marketing-strategy"
    }
]; 