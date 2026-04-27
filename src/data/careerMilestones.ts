import type { CareerMilestone } from '@/components/timeline/CareerTimeline';

export const careerMilestones: CareerMilestone[] = [
  {
    year: '2013-2016',
    role: 'LSE',
    org: 'Philosophy and Economics',
    desc: "Studied Philosophy and Economics at LSE. I figured philosophy would help me work out how the world SHOULD be, and economics would teach me HOW to get there. I'm still working on it.",
    images: [
      {
        src: '/2016_lse_graduation.JPG',
        alt: 'Angus at LSE graduation with his parents',
      },
      {
        src: '/2016_lse_graduation_throwing_hats.JPG',
        alt: 'LSE graduates throwing their caps in the air',
      },
    ],
    color: 'primary',
    side: 'right',
  },
  {
    year: '2016',
    role: 'Mathematics Teacher',
    org: 'TeachFirst / Burnt Mill Academy',
    desc: "Teaching in London schools through TeachFirst. To this day, the hardest thing I've done.",
    image: {
      src: '/20180311_Teaching_Harlow_UK.jpeg',
      alt: 'Angus teaching mathematics at Burnt Mill Academy in Harlow',
    },
    color: 'accent',
    side: 'left',
  },
  {
    year: '2018',
    role: 'Analyst then Strategist',
    org: 'Accenture',
    desc: 'Digital transformation across the Royal Navy, Police, and Courts. Then pricing strategy and GDPR in telecom and insurance.',
    image: {
      src: '/20191203_CIGS_Night_out.jpg',
      alt: 'Angus with colleagues on a night out in London',
    },
    color: 'secondary',
    side: 'right',
  },
  {
    year: '2020',
    role: 'COO',
    org: 'Teamvine (Future Factory Ltd)',
    desc: 'Oversaw product, customer services, sales, marketing, compliance, governance, content, ops, IP. Led agile dev teams. Shipped 4 digital products in 6 months. Secured £100k UKRI grant.',
    image: {
      src: '/teamvine.png',
      alt: 'Teamvine homepage hero showing online team building activities',
    },
    color: 'primary',
    side: 'left',
  },
  {
    year: '2022',
    role: 'Data Strategy Manager',
    org: 'Anmut',
    desc: 'Data valuation and data maturity. Helping organisations understand what their data is actually worth.',
    images: [
      {
        src: '/20241023_Anmut_JLR_Data_Fest.jpg',
        alt: 'Angus and Anmut colleagues at JLR Data Fest',
      },
      {
        src: '/20260426_anmut_strat_dinner.jpg',
        alt: 'Angus with Anmut colleagues at a strategy dinner',
      },
    ],
    color: 'secondary',
    side: 'right',
  },
  {
    year: '2025',
    role: 'COO',
    org: 'HeyLina',
    desc: "Building emotionally intelligent AI. The most exciting thing I've ever worked on.",
    images: [
      {
        src: '/20250927_heylina_Strategy_day.jpg',
        alt: 'HeyLina team working through a strategy day',
      },
      {
        src: '/20260327_Heylina_Pitch_Video.png',
        alt: 'Angus and a HeyLina colleague recording a pitch video',
      },
    ],
    color: 'success',
    side: 'left',
  },
];
