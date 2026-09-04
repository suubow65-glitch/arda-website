export type ActivityStatus = "Ongoing" | "Completed";

export type FocusArea = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  longDescription: string;
  interventions: string[];
  icon:
    | "peace"
    | "youth"
    | "food"
    | "education"
    | "health"
    | "nutrition"
    | "wash"
    | "protection";
};

export type HeroSlide = {
  id: string;
  category: string;
  title: string;
  description: string;
  image: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type Activity = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  location: string;
  region: string;
  date: string;
  status: ActivityStatus;
  sector: string;
  beneficiaries?: string;
  image: string;
};

export type DocumentItem = {
  id: string;
  title: string;
  type: string;
  year: string;
  size: string;
  href: string;
  description: string;
};

export type RegionHub = {
  name: string;
  hubs: string;
  focus: string;
};

export type PersonProfile = {
  name: string;
  role: string;
  bio: string;
};

export const org = {
  name: "Action for Relief And Development Agency (ARDA)",
  shortName: "ARDA",
  domain: "arda.org.so",
  website: "www.arda.org.so",
  email: "info@arda.org.so",
  phone: "+252-0624599060",
  location: "Baidoa, Southwest State, Somalia",
  address: "Mogadishu Road, Adaada, Baidoa, Southwest State, Somalia",
  established: "2017",
  registrations:
    "Federal Ministry of Interior Ref #2123 · Southwest State MoPIED Reg #6173",
  executiveDirector: "Isse Abdullahi Hassan",
  tagline:
    "Designing and implementing life changing Relief and development programs that alleviate climatic change risks and deepening poverty in collaboration with relevant stakeholders to ensure holistic sustainable development in Somalia.",
  vision:
    "We seek to see crisis resilient Somali communities with equitable Solutions to climate induced crisis and with available and accessible basic services and having sustainable livelihoods.",
  mission:
    "Designing and implementing life changing Relief and development programs that alleviate climatic change risks and deepening poverty in collaboration with relevant stakeholders to ensure holistic sustainable development in Somalia.",
};

export const heroSlides: HeroSlide[] = [
  {
    id: "epi-phc-nutrition",
    category: "Primary Health Care",
    title: "Integrated EPI/PHC & Nutrition Programme Delivery",
    description:
      "Delivering essential immunisation, primary health care and nutrition services to vulnerable communities across Southwest State in partnership with KOREA, UNICEF and the Ministry of Health.",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=2000&q=80",
    primaryCta: { label: "Partner With Us", href: "/contact" },
    secondaryCta: { label: "Our Focus Areas", href: "/focus-areas" },
  },
  {
    id: "livestock-management",
    category: "Food Security & Livelihoods",
    title: "Livestock Management Training for Agro-Pastoral Households",
    description:
      "Building resilience for 800 agro-pastoral households in Baidoa District through improved livestock management, supported by the Canadian Development Agency.",
    image:
      "https://images.unsplash.com/photo-1500595046743-cd271e50e533?auto=format&fit=crop&w=2000&q=80",
    primaryCta: { label: "Our Activities", href: "/activities" },
    secondaryCta: { label: "About ARDA", href: "/about" },
  },
  {
    id: "agriculture-gap",
    category: "Agriculture & Livelihoods",
    title: "Agriculture & Good Agricultural Practice Training",
    description:
      "Improving crop production and food security for 400 poor farming households in Baidoa District through climate-smart agriculture and GAP training with AGDAC (Norway).",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2000&q=80",
    primaryCta: { label: "View Projects", href: "/activities" },
    secondaryCta: { label: "Download Reports", href: "/documents" },
  },
];

export const impactStats = [
  { value: 8, suffix: "", label: "Core Programmatic Pillars" },
  { value: 2, suffix: "+", label: "Target States" },
  { value: 15, suffix: "+", label: "Active Volunteers" },
];

export const focusAreas: FocusArea[] = [
  {
    slug: "peace-building",
    title: "Peace Building & Reconciliation",
    shortTitle: "Peace Building",
    description:
      "Conflict analysis, mediation, youth and women peace agents, and early warning systems.",
    longDescription:
      "ARDA strengthens local conflict prevention and resolution through participatory conflict analysis, community mediation, and youth and women peace agents. We support early warning mechanisms and promote social cohesion in areas affected by resource competition and displacement.",
    interventions: [
      "Conflict analysis and mapping",
      "Community mediation and dialogue",
      "Youth and women peace agents",
      "Early warning and early response",
    ],
    icon: "peace",
  },
  {
    slug: "youth-women-empowerment",
    title: "Youth and Women Empowering",
    shortTitle: "Youth & Women",
    description:
      "TVET skills, business development services, incubation, VSLAs, and Youth Peace & Security.",
    longDescription:
      "We equip youth and women with demand-driven TVET skills, business development support, incubation services, village savings and loan associations, and leadership spaces anchored in UN Security Council Resolution 2250 on Youth, Peace and Security.",
    interventions: [
      "TVET skills training",
      "Business development services (BDS)",
      "Business incubation and mentorship",
      "Village savings and loan associations (VSLAs)",
      "Youth, Peace and Security (UNSCR 2250)",
    ],
    icon: "youth",
  },
  {
    slug: "food-security-agriculture",
    title: "Food Security, Agriculture and Livelihood Development",
    shortTitle: "Food & Livelihoods",
    description:
      "Climate-Smart Agriculture, livestock management, and emergency cash and voucher assistance.",
    longDescription:
      "ARDA improves food security and livelihoods through Climate-Smart Agriculture, livestock management, crop diversification, market linkages, and emergency cash and voucher assistance for vulnerable households affected by climate shocks.",
    interventions: [
      "Climate-Smart Agriculture (CSA)",
      "Livestock management and animal health",
      "Emergency cash and voucher assistance",
      "Post-harvest handling and storage",
      "Market linkages and value chains",
    ],
    icon: "food",
  },
  {
    slug: "inclusive-education",
    title: "Inclusive Basic Education",
    shortTitle: "Education",
    description:
      "Special Needs Education, teacher training, and child-friendly safe spaces.",
    longDescription:
      "We promote inclusive basic education with a focus on Special Needs Education, teacher professional development, school rehabilitation, and child-friendly safe spaces that protect and support children in crisis-affected settings.",
    interventions: [
      "Special Needs Education (SNE)",
      "Teacher training and professional development",
      "Child-friendly safe spaces",
      "School rehabilitation and WASH in schools",
    ],
    icon: "education",
  },
  {
    slug: "primary-health-care",
    title: "Primary Health Care",
    shortTitle: "Health Care",
    description:
      "Mobile health clinics, PEP kits, and maternal and child health in hard-to-reach areas.",
    longDescription:
      "ARDA delivers primary health care through mobile clinics, post-exposure prophylaxis (PEP) kits, maternal and child health services, and disease surveillance in hard-to-reach and underserved areas of Southwest State and Banadir.",
    interventions: [
      "Mobile and static health clinics",
      "Post-exposure prophylaxis (PEP) kits",
      "Maternal and child health services",
      "Disease surveillance and outbreak response",
    ],
    icon: "health",
  },
  {
    slug: "nutrition",
    title: "Nutrition",
    shortTitle: "Nutrition",
    description:
      "Targeted Supplementary Feeding Programmes and infant and young child feeding practices.",
    longDescription:
      "We tackle acute and chronic malnutrition through Targeted Supplementary Feeding Programmes, infant and young child feeding counselling, maternal nutrition education, and community-based management of malnutrition.",
    interventions: [
      "Targeted Supplementary Feeding Programmes (TSFPs)",
      "Infant and young child feeding (IYCF)",
      "Maternal nutrition education",
      "Community-based management of malnutrition",
    ],
    icon: "nutrition",
  },
  {
    slug: "wash",
    title: "Water, Sanitation and Promotion of Hygiene (WASH)",
    shortTitle: "WASH",
    description:
      "Birkads, shallow wells, water management committees, and hygiene promotion.",
    longDescription:
      "ARDA improves WASH access through birkads, shallow wells, borehole rehabilitation, water management committees, and community hygiene promotion to reduce waterborne disease and improve health outcomes.",
    interventions: [
      "Birkads and water harvesting",
      "Shallow wells and borehole rehabilitation",
      "Water management committees",
      "Hygiene promotion and behaviour change",
    ],
    icon: "wash",
  },
  {
    slug: "protection-gender",
    title: "Protection and Gender Inclusion",
    shortTitle: "Protection",
    description:
      "GBV prevention, women and girl safe spaces, Communities Care, and rights advocacy.",
    longDescription:
      "We advance protection and gender inclusion through GBV prevention, women and girl safe spaces, the Communities Care model, psychosocial support, and rights advocacy for women, girls, and other at-risk groups.",
    interventions: [
      "GBV prevention and risk mitigation",
      "Women and girl safe spaces (WGSS)",
      "Communities Care model",
      "Rights advocacy and legal aid referrals",
    ],
    icon: "protection",
  },
];

export const regions: RegionHub[] = [
  {
    name: "Southwest State of Somalia",
    hubs: "Baidoa, Burhakaba, Bay and Bakool",
    focus: "Primary implementation area for health, nutrition, WASH and livelihoods programming",
  },
  {
    name: "Baidoa District",
    hubs: "Mogadishu Road, Adaada",
    focus: "Head office location and programme coordination hub",
  },
  {
    name: "Burhakaba District",
    hubs: "Burhakaba",
    focus: "Co-Chair of Area-Based Coordination (ABC) mechanism with OCHA support",
  },
  {
    name: "Banadir Regional Administration",
    hubs: "Mogadishu",
    focus: "Federal liaison, coordination and partnership engagement with BRA",
  },
];

export const activities: Activity[] = [
  {
    id: "act-001",
    slug: "epi-phc-nutrition",
    title: "Integration of EPI/PHC & Nutrition Program Delivery",
    summary:
      "Essential immunisation, primary health care and nutrition services across Southwest State.",
    description:
      "This programme delivers integrated Expanded Programme on Immunisation (EPI), primary health care and nutrition services in Southwest State of Somalia. Implemented with support from KOREA, UNICEF and the Federal Ministry of Health Southwest State, it strengthens health system capacity and reaches vulnerable children, mothers and communities.",
    location: "Southwest State of Somalia",
    region: "Southwest State",
    date: "2026-06-01",
    status: "Ongoing",
    sector: "Primary Health Care",
    beneficiaries: "Budget: $56,700",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "act-002",
    slug: "livestock-management",
    title: "Livestock Management Training for 800 Agro-Pastoral Households",
    summary:
      "Improved animal health and productivity for agro-pastoral households in Baidoa.",
    description:
      "ARDA trained 800 agro-pastoral households in Baidoa District on improved livestock management practices, animal health, fodder production and resilience planning. Funded by the Canadian Development Agency (CDA), the project strengthened household food and income security.",
    location: "Baidoa District",
    region: "Bay Region",
    date: "2025-12-31",
    status: "Completed",
    sector: "Food Security, Agriculture and Livelihood Development",
    beneficiaries: "Budget: $213,900",
    image:
      "https://images.unsplash.com/photo-1500595046743-cd271e50e533?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "act-003",
    slug: "agriculture-gap-training",
    title: "Improvement on Agriculture & GAP Training for 400 Poor Farmers",
    summary:
      "Climate-smart agriculture and good agricultural practices for smallholder farmers.",
    description:
      "With support from AGDAC (Norway), ARDA provided 400 poor farmers in Baidoa District, Bay Region, with training on Good Agricultural Practices (GAP), improved seed, soil and water management, and post-harvest handling to improve yields and food security.",
    location: "Baidoa District, Bay Region",
    region: "Bay Region",
    date: "2024-12-31",
    status: "Completed",
    sector: "Food Security, Agriculture and Livelihood Development",
    beneficiaries: "Budget: $267,546",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "act-004",
    slug: "abc-coordination",
    title: "Area-Based Coordination (ABC) Co-Chair in Burhakaba",
    summary:
      "Co-Chair of the Area-Based Coordination (ABC) mechanism in Burhakaba District.",
    description:
      "ARDA serves as the Co-Chair of the Area-Based Coordination (ABC) mechanism in Burhakaba District, providing leadership for humanitarian and development coordination with technical support from UN OCHA. This role strengthens local response planning, information sharing and partnership alignment.",
    location: "Burhakaba District",
    region: "Southwest State",
    date: "2026-01-01",
    status: "Ongoing",
    sector: "Peace Building & Reconciliation",
    beneficiaries: "Coordination support",
    image:
      "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
  },
];

export const latestActivities = activities.slice(0, 3);

export const documents: DocumentItem[] = [
  {
    id: "doc-001",
    title: "ARDA Annual Report 2024",
    type: "Annual Report",
    year: "2024",
    size: "2.1 MB",
    href: "/documents/arda-annual-report-2024.pdf",
    description:
      "Programme results, financial overview and regional coverage for the 2024 fiscal year.",
  },
  {
    id: "doc-002",
    title: "HR Policy",
    type: "Policy",
    year: "2025",
    size: "320 KB",
    href: "/documents/arda-hr-policy.pdf",
    description:
      "Human resources policies, recruitment, conduct and staff welfare for ARDA personnel.",
  },
  {
    id: "doc-003",
    title: "PSEA Policy",
    type: "Policy",
    year: "2025",
    size: "420 KB",
    href: "/documents/arda-psea-policy.pdf",
    description:
      "Prevention of sexual exploitation, abuse and harassment policy for staff, partners and beneficiaries.",
  },
  {
    id: "doc-004",
    title: "Code of Conduct",
    type: "Policy",
    year: "2025",
    size: "280 KB",
    href: "/documents/arda-code-of-conduct.pdf",
    description:
      "Ethical standards, neutrality and accountability commitments for ARDA personnel.",
  },
  {
    id: "doc-005",
    title: "Procurement Policy",
    type: "Policy",
    year: "2026",
    size: "310 KB",
    href: "/documents/arda-procurement-policy.pdf",
    description:
      "Open and transparent procurement, tendering and supplier management guidelines.",
  },
];

function badge(text: string, color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="80" viewBox="0 0 200 80"><rect width="200" height="80" rx="16" fill="${color}"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="32" font-family="Arial, sans-serif" font-weight="bold">${text}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export const partners = [
  { name: "UNICEF", initials: "UNICEF", logoUrl: badge("UNICEF", "#1CABE2"), websiteUrl: "" },
  { name: "KOREA / UNICEF & MoH Southwest State", initials: "KOREA", logoUrl: badge("KOREA", "#C60C30"), websiteUrl: "" },
  { name: "Canadian Development Agency (CDA)", initials: "CDA", logoUrl: badge("CDA", "#D52B1E"), websiteUrl: "" },
  { name: "AGDAC (Norway)", initials: "AGDAC", logoUrl: badge("AGDAC", "#2E7D32"), websiteUrl: "" },
  { name: "UN OCHA", initials: "OCHA", logoUrl: badge("OCHA", "#0072BB"), websiteUrl: "" },
];

export const leadership: PersonProfile[] = [
  {
    name: "Programmes Director",
    role: "Senior Manager",
    bio: "Oversight of multi-sector programme design and delivery across Southwest State and Banadir.",
  },
  {
    name: "Finance and Compliance Director",
    role: "Senior Manager",
    bio: "Responsible for audit readiness, donor compliance and transparent financial reporting.",
  },
  {
    name: "Operations Manager",
    role: "Senior Manager",
    bio: "Coordinates field logistics, security, procurement and support services in Baidoa and partner districts.",
  },
  {
    name: "Monitoring and Evaluation Manager",
    role: "Senior Manager",
    bio: "Leads data collection, learning, accountability and results reporting for all ARDA projects.",
  },
];

export const boardMembers: PersonProfile[] = [
  {
    name: "Chairperson of the Board",
    role: "Board Chair",
    bio: "Provides strategic governance leadership and oversight for ARDA's mission and programmes.",
  },
  {
    name: "Vice Chairperson",
    role: "Vice Chair",
    bio: "Supports the Chair in governance, board development and strategic decision-making.",
  },
  {
    name: "Treasurer",
    role: "Board Treasurer",
    bio: "Oversees financial oversight, budget approval and audit review on behalf of the Board.",
  },
  {
    name: "Secretary",
    role: "Board Secretary",
    bio: "Manages board records, meeting minutes and governance compliance.",
  },
  {
    name: "Board Member",
    role: "Member",
    bio: "Contributes to policy, programme and organisational strategy from a community and humanitarian perspective.",
  },
];

export const coreValues = [
  {
    title: "Moral and Ethical Integrity",
    description:
      "We act with honesty, fairness and strong moral principles in all our work and relationships.",
    icon: "shield-check",
  },
  {
    title: "Solidarity with the Poor",
    description:
      "We stand alongside the most vulnerable and work to improve their lives with compassion and respect.",
    icon: "heart-handshake",
  },
  {
    title: "Transparency and Accountability",
    description:
      "We are open and responsible in our decisions, resource use and reporting to communities, donors and authorities.",
    icon: "check-circle",
  },
  {
    title: "Environmentally Conscious",
    description:
      "We design and implement programmes that protect and sustain the natural environment.",
    icon: "leaf",
  },
  {
    title: "Participation",
    description:
      "We ensure communities, partners and stakeholders are meaningfully involved in decisions that affect them.",
    icon: "users",
  },
  {
    title: "Gender Sensitivity",
    description:
      "We recognise and address the different needs, roles and opportunities of women, men, girls and boys.",
    icon: "heart-pulse",
  },
  {
    title: "Equity & Inclusion",
    description:
      "We promote fairness and ensure all people, including those with disabilities and minorities, are included.",
    icon: "scale",
  },
  {
    title: "Learning and Innovation",
    description:
      "We continuously learn, adapt and innovate to improve our impact and efficiency.",
    icon: "sparkles",
  },
];

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/focus-areas", label: "Focus Areas" },
  { href: "/activities", label: "Activities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/documents", label: "Documents/Reports" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact Us" },
];
