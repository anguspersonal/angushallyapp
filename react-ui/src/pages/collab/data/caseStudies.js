import { IconBulb, IconRocket, IconChartBar, IconUsers, IconShieldLock, IconHammer } from '@tabler/icons-react';

export const caseStudies = [
    {
      id: 0,
      type: 'caseStudy',
      image: "/20250419_Analog_to_Digital_Transition_Teamvine.png",
      icon: <IconBulb size={24} />,
      title: "Future Factory Pivot to Teamvine",
      tags: ["startup", "grant funding", "product strategy"],
      challenge:
        "Pivoting from physical team-building kits to an online platform with no technical founder or external funding.",
      solution:
        "Secured a £100k Innovate UK grant, built the MVP with part-time developers, and launched the first digital product.",
      outcome:
        "Established Teamvine as a digital-first company and validated the new business model through early traction.",
      blogPostSlug: "/blog/future-factory-digital-pivot"
    },
    {
      id: 1,
      type: 'caseStudy',
      image: "/20250419_Digital_Courtroom_Scene.png",
      icon: <IconRocket size={24} />,
      title: "COVID Rollout – Remote Justice Enablement",
      tags: ["public sector", "covid response", "delivery leadership"],
      challenge:
        "Hundreds of legal staff needed access to remote court systems during lockdown, but onboarding was slow and unscalable.",
      solution:
        "Redesigned the onboarding process, managed a team of analysts, and scaled onboarding from 2 to 30 users/day.",
      outcome:
        "Enabled 500+ legal professionals across 5 agencies to access court remotely, keeping justice moving during lockdown.",
      blogPostSlug: "/blog/vej-pandemic-rollout"
    },
    {
      id: 2,
      type: 'caseStudy',
      image: "/20250419_Strategic_Corporate_Insights.png",
      icon: <IconChartBar size={24} />,
      title: "£4M Commercial Insight (Telecoms)",
      tags: ["data analysis", "customer segmentation", "enterprise"],
      challenge:
        "Client lacked a behaviour-based view of customers, limiting upsell opportunities across thousands of tariffs.",
      solution:
        "Developed four models using product usage data and cluster analysis to identify micro-segments.",
      outcome:
        "Identified £12.3M in opportunity; £4M uplift realised through revised sales targeting within a year.",
      blogPostSlug: "/blog/commercial-usage-insight"
    },
    {
      id: 3,
      type: 'caseStudy',
      image: "/20250419_Telecom_Store_Observation.png",
      icon: <IconUsers size={24} />,
      title: "Retail Journey Uplift – Secret Shopper Insight",
      tags: ["cx design", "conversion", "retail"],
      challenge:
        "Retail stores failed to capture consent from walkouts, limiting follow-up and conversion.",
      solution:
        "Performed secret shopper visits, identified the gap, and led a redesign of the customer journey.",
      outcome:
        "Proposed changes projected to increase revenue by £1.1M–£3.5M annually through re-engagement.",
      blogPostSlug: "/blog/retail-journey-insight"
    },
    {
      id: 4,
      type: 'caseStudy',
      image: "/20250419_Data_Operations_Room.png",
      icon: <IconShieldLock size={24} />,
      title: "DVSA Data Valuation & Strategy",
      tags: ["data strategy", "public sector", "valuation"],
      challenge:
        "DVSA held extensive datasets but lacked a strategy to prioritise data investment.",
      solution:
        "Led a valuation project to assess financial and strategic impact of data assets.",
      outcome:
        "Delivered a framework used to guide strategic data funding and investment prioritisation.",
      blogPostSlug: "/blog/dvsa-data-valuation"
    },
    {
      id: 5,
      type: 'caseStudy',
      image: "/20250419_Unified_Data_Illumination.png",
      icon: <IconHammer size={24} />,
      title: "Marketing Consent & Data Strategy (Telecom)",
      tags: ["gdpr", "data governance", "revenue modelling"],
      challenge:
        "Conflicting customer preferences across systems made many contacts unmarketable, limiting revenue.",
      solution:
        "Modelled uplift from unifying identity and consent data; built a £2.7M–£4.5M p.a. business case for centralisation.",
      outcome:
        "Influenced data roadmap; became a go-to for privacy strategy among MDs and data leads.",
      blogPostSlug: "/blog/telecom-gdpr-marketing-strategy"
    }
];
  