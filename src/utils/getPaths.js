// ─── PATH LIBRARY ─────────────────────────────────────────────────────────────
// Every possible income path with scoring signals

const ALL_PATHS = [
  {
    id: "remote_medva",
    icon: "💻",
    label: "Medical Virtual Assistant",
    teaser: "Nigerian healthcare professionals are being hired by US and UK clinics as remote Medical VAs — handling prior authorisations, clinical documentation, patient coordination, and more. No relocation. Dollar pay. Your clinical background is the entry ticket. Your blueprint reveals exactly which roles match your specialty and how to land your first client.",
    scores: {
      income_type: ["Remote income", "dollar", "foreign currency"],
      skills: ["Virtual assistance", "remote admin", "Medical coding", "Prior authorisation"],
      visibility: ["faceless", "brand", "zero personal"],
      content: ["None — I would prefer income", "Downloadable"],
      energy: ["systems builder", "analytical", "reserved"],
      goal: ["Dollar income", "USD", "GBP"],
    }
  },
  {
    id: "prior_auth",
    icon: "📋",
    label: "Prior Authorisation Specialist",
    teaser: "US insurance companies pay Nigerian healthcare professionals $15–$30/hour to review and approve clinical cases remotely. This is one of the most overlooked dollar-income paths for doctors and nurses — and one of the fastest to enter. Your blueprint shows you exactly how to get certified, where to apply, and what the work actually involves.",
    scores: {
      income_type: ["Remote income", "dollar", "foreign currency"],
      profession: ["Doctor", "Nurse", "Pharmacist"],
      skills: ["Prior authorisation", "insurance", "Medical coding"],
      energy: ["analytical", "precise", "systems builder"],
    }
  },
  {
    id: "med_writing",
    icon: "✍️",
    label: "Medical Writing & Content",
    teaser: "Pharmaceutical companies, health NGOs, and medical publishers pay well for clinical writers who understand the science. Your specialty gives you an authority that no English graduate can replicate. This path requires no audience, no camera, and no social media. Your blueprint identifies the exact writing niches that match your background and where to find your first paid project.",
    scores: {
      skills: ["Writing", "long-form", "Copywriting", "Medical", "health education"],
      content: ["Writing", "newsletters", "articles"],
      energy: ["reserved", "analytical", "precise"],
      visibility: ["faceless", "brand", "zero personal"],
      income_type: ["Passive income", "Remote income"],
    }
  },
  {
    id: "private_consult",
    icon: "🩺",
    label: "Private Consultation Practice",
    teaser: "There is a direct, no-audience-required path to earning ₦150,000–₦500,000 per month from your clinical expertise — through private consultations. No platform needed. No content. No existing audience. It starts with one WhatsApp message to the right person. Your blueprint shows you exactly how to price it, who to target, and how to get your first paying client this week.",
    scores: {
      profession: ["Doctor", "Nurse", "Pharmacist", "Dentist", "Physiotherapist", "Optometrist"],
      income_type: ["Active local income"],
      energy: ["one-on-one", "warm", "teacher"],
      visibility: ["Fully visible", "Professionally visible"],
      goal: ["₦150,000", "₦500,000", "₦1,000,000"],
    }
  },
  {
    id: "health_content",
    icon: "📱",
    label: "Health Content Creator",
    teaser: "Nigerian audiences are starving for trusted health information from real clinicians — not influencers pretending to be doctors. Your specialty is a content category in itself. This path shows you exactly what to post, on which platform, how often, and how to turn an audience into paying clients — without burning out on content creation.",
    scores: {
      content: ["Short video", "Reels", "Writing", "threads", "Visual content", "carousels"],
      energy: ["naturally engaging", "teacher", "connector"],
      visibility: ["Fully visible", "Professionally visible", "Selectively visible"],
      income_type: ["Active local income", "Passive income"],
      skills: ["Social media", "content strategy", "Graphic design", "Video editing"],
    }
  },
  {
    id: "digital_products",
    icon: "📦",
    label: "Digital Products & Passive Income",
    teaser: "Your clinical knowledge can be packaged into e-books, templates, checklists, and guides that sell while you sleep — on Selar, Gumroad, or your own website. This is the lowest-risk, highest-leverage way to build passive income from your expertise. No audience required to start. Your blueprint identifies the exact product that fits your specialty and shows you how to create and sell it in 30 days.",
    scores: {
      income_type: ["Passive income", "products", "systems"],
      content: ["Downloadable", "templates", "guides"],
      energy: ["systems builder", "analytical", "reserved"],
      skills: ["Writing", "Graphic design", "content creation"],
      visibility: ["faceless", "brand", "Selectively visible"],
    }
  },
  {
    id: "online_courses",
    icon: "🎓",
    label: "Online Courses & Teaching",
    teaser: "Nigerian healthcare students, junior doctors, and allied health professionals are actively paying for clinical skill development, career guidance, and exam preparation — and there are almost no credible course creators serving them. Your years of experience are a curriculum. Your blueprint maps out the exact course topic, format, platform, and launch strategy that fits your specialty.",
    scores: {
      content: ["Long-form video", "Structured courses", "cohort-based", "webinars"],
      energy: ["teacher", "simplify", "explaining"],
      income_type: ["Passive income", "Business ownership"],
      skills: ["Teaching", "training", "facilitating"],
      audience: ["Other healthcare professionals", "Health sciences students"],
    }
  },
  {
    id: "corporate_wellness",
    icon: "🏢",
    label: "Corporate Wellness & Speaking",
    teaser: "Nigerian companies are paying ₦50,000–₦300,000 per session for workplace health talks, wellness programmes, and health screenings for their staff. This is one of the most accessible high-ticket income paths for any clinician — and most companies are actively looking. Your blueprint identifies which companies to target, how to pitch, and exactly what to offer first.",
    scores: {
      energy: ["naturally engaging", "presenter", "public speaking"],
      content: ["Live sessions", "presentations", "Long-form video"],
      skills: ["Public speaking", "presenting", "Teaching"],
      visibility: ["Fully visible", "Professionally visible"],
      income_type: ["Active local income", "Business ownership"],
      audience: ["corporate professionals", "executives"],
    }
  },
  {
    id: "health_coaching",
    icon: "🎯",
    label: "Health Coaching & Advisory",
    teaser: "Nigerians managing chronic conditions, planning pregnancies, or trying to lose weight are actively paying for personalised health guidance they cannot get in a 5-minute hospital consultation. Your clinical background gives you authority that no wellness coach can match. This path shows you how to structure, price, and deliver high-value health coaching that is both profitable and professionally sound.",
    scores: {
      energy: ["one-on-one", "warm", "connector"],
      content: ["One-on-one conversations", "coaching", "consultations"],
      income_type: ["Active local income"],
      audience: ["Patients managing chronic conditions", "Women", "Parents", "Health-conscious"],
      skills: ["Sales", "consulting", "business development"],
    }
  },
  {
    id: "health_tech",
    icon: "⚡",
    label: "Health Tech & Digital Ventures",
    teaser: "The Nigerian health tech space is growing fast — and clinical co-founders, product advisors, and healthcare consultants for tech companies are in high demand. If you have ever thought about building a health platform, this path maps out how to validate, launch, and fund a healthcare digital product using your clinical expertise as the core asset.",
    scores: {
      income_type: ["Business ownership", "scalable", "Career transition"],
      skills: ["Coding", "web development", "Data analysis", "Project management"],
      tech: [7, 8, 9, 10],
      energy: ["systems builder", "analytical", "builder"],
    }
  },
  {
    id: "aesthetics",
    icon: "💆",
    label: "Medical Aesthetics & Wellness",
    teaser: "Medical aesthetics is one of the fastest-growing and most profitable extensions of clinical practice in Nigeria — with relatively low setup costs and extremely high demand. Botox, fillers, skin treatments, and wellness services command premium prices and loyal clients. Your blueprint maps the exact training, setup costs, regulatory requirements, and first client acquisition strategy.",
    scores: {
      skills: ["Hairdressing", "beauty", "skincare", "aesthetics"],
      income_type: ["Active local income", "Business ownership"],
      audience: ["Health-conscious", "aesthetics", "wellness"],
      energy: ["one-on-one", "naturally engaging"],
    }
  },
  {
    id: "community_building",
    icon: "🤝",
    label: "Healthcare Community & Membership",
    teaser: "A paid membership community built around your specialty — whether for patients, caregivers, or fellow clinicians — can generate recurring monthly income that grows with every new member. Nigerian WhatsApp and Telegram communities around specific health topics have already proven this model. Your blueprint shows you how to build, price, and grow a community that pays you every month.",
    scores: {
      energy: ["connector", "brings people together", "community"],
      content: ["Live sessions", "group calls", "Audio"],
      income_type: ["Business ownership", "Portfolio income", "Passive income"],
      skills: ["Project management", "Event planning", "Teaching"],
      audience: ["Other healthcare professionals", "Patients managing chronic conditions"],
    }
  },
];

// ─── SCORING ENGINE ───────────────────────────────────────────────────────────
export const getPaths = (answers) => {
  const incomeType = answers.income_type_preference || "";
  const skills = answers.non_clinical_skills || "";
  const energy = (answers.energy_type || "").toLowerCase();
  const visibility = (answers.visibility_preference || "").toLowerCase();
  const content = answers.content_comfort || "";
  const goal = answers.income_goal || "";
  const audience = answers.target_audience || "";
  const profession = answers.profession || "";
  const tech = parseInt(answers.tech_comfort) || 0;

  const scored = ALL_PATHS.map(path => {
    let score = 0;
    const s = path.scores;

    if (s.income_type) s.income_type.forEach(kw => { if (incomeType.toLowerCase().includes(kw.toLowerCase())) score += 3; });
    if (s.skills) s.skills.forEach(kw => { if (skills.toLowerCase().includes(kw.toLowerCase())) score += 2; });
    if (s.energy) s.energy.forEach(kw => { if (energy.includes(kw.toLowerCase())) score += 2; });
    if (s.visibility) s.visibility.forEach(kw => { if (visibility.includes(kw.toLowerCase())) score += 1; });
    if (s.content) s.content.forEach(kw => { if (content.toLowerCase().includes(kw.toLowerCase())) score += 2; });
    if (s.goal) s.goal.forEach(kw => { if (goal.includes(kw)) score += 2; });
    if (s.audience) s.audience.forEach(kw => { if (audience.toLowerCase().includes(kw.toLowerCase())) score += 1; });
    if (s.profession) s.profession.forEach(kw => { if (profession.includes(kw)) score += 1; });
    if (s.tech) { if (s.tech.includes(tech)) score += 2; }

    return { ...path, score };
  });

  // Sort by score descending, take top 3
  const top3 = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Label the top one as best fit
  if (top3.length > 0) top3[0].fit = "high";
  if (top3.length > 1) top3[1].fit = "medium";
  if (top3.length > 2) top3[2].fit = "medium";

  return top3;
};
