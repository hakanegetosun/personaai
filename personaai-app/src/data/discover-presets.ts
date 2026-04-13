export type DiscoverReferenceItem = {
  id: number;
  title: string;
  vibe: string;
  gradient?: string;
  imageUrl?: string;
};

export type DiscoverRecommendedControls = {
  look: string;
  motion: string;
  strategy: string;
  priorities: string[];
};

export type DiscoverPreset = {
  id: number;
  presetId: string;
  name: string;
  handle: string;
  initials: string;
  badge: string;
  coverImageUrl?: string;
  tags: string[];
  chips: string[];
  glowA: string;
  glowB: string;
  bg: string;
  bio: string;
  bestFor: string[];
  category: string;
  niche: string;
  recommended: DiscoverRecommendedControls;
  references: DiscoverReferenceItem[];
};

export function presetAsset(slug: string, file: string) {
  return `https://ctddvjznktqecgebldzt.supabase.co/storage/v1/object/public/preset-personas/${slug}/${file}`;
}

export const DISCOVER_PRESETS: DiscoverPreset[] = [
  {
    id: 1,
    presetId: "preset-siena-stone",
    name: "Siena Stone",
    handle: "@siena.stone",
    initials: "SS",
    badge: "94%",
    tags: ["Fitness", "Viral"],
    chips: ["High eng.", "Strong brand", "Viral-ready"],
    glowA: "rgba(168,85,247,.60)",
    glowB: "rgba(236,72,153,.40)",
    bg: "linear-gradient(170deg,#1a0a2e 0%,#2d1060 40%,#180830 75%,#0f0820 100%)",
    bio: "High-energy fitness creator with strong short-form potential. Great for gym reels, routine content, wellness hooks, and bold creator-style performance posts.",
    bestFor: [
      "Gym routine reels",
      "Meal prep content",
      "Morning wellness stories",
      "High-hook short form",
    ],
    category: "Fitness",
    niche: "Wellness / Performance",
    recommended: {
      look: "Luxury Realism",
      motion: "Fast Hooky",
      strategy: "Viral Reach",
      priorities: ["Face Consistency", "Realism", "Hook Strength"],
    },
    references: [
      {
        id: 11,
        title: "Gym mirror check",
        vibe: "strong hook",
        gradient: "linear-gradient(160deg,#1b1030,#522082,#1a0b2a)",
      },
      {
        id: 12,
        title: "Breakfast counter",
        vibe: "healthy lifestyle",
        gradient: "linear-gradient(160deg,#24112d,#7a265b,#241028)",
      },
      {
        id: 13,
        title: "Pilates studio",
        vibe: "clean fitness",
        gradient: "linear-gradient(160deg,#171833,#3244a0,#121429)",
      },
      {
        id: 14,
        title: "Outdoor run prep",
        vibe: "natural movement",
        gradient: "linear-gradient(160deg,#102128,#1f6d5c,#0b1818)",
      },
      {
        id: 15,
        title: "Post-workout selfie",
        vibe: "phone native",
        gradient: "linear-gradient(160deg,#2a1323,#7c2454,#1a0b17)",
      },
    ],
  },
  {
    id: 2,
    presetId: "preset-luna-vale",
    name: "Luna Vale",
    handle: "@luna.vale",
    initials: "LV",
    badge: "87%",
    coverImageUrl: presetAsset("luna-vale", "Cover.jpg"),
    tags: ["Lifestyle", "Fashion"],
    chips: ["Aesthetic", "Premium", "Top-tier"],
    glowA: "rgba(99,102,241,.60)",
    glowB: "rgba(59,130,246,.40)",
    bg: "linear-gradient(170deg,#0a1a2e 0%,#103060 40%,#0c1e40 75%,#08152e 100%)",
    bio: "Premium fashion and lifestyle persona designed for polished mirror selfies, elevated daily style content, clean indoor aesthetics, and believable creator-led outfit posts.",
    bestFor: [
      "Mirror outfit selfies",
      "Daily fashion content",
      "Soft premium lifestyle posts",
      "Clean creator-style reels",
    ],
    category: "Lifestyle",
    niche: "Fashion / City Aesthetic",
    recommended: {
      look: "Clean Editorial",
      motion: "Balanced",
      strategy: "Brand Safe",
      priorities: ["Realism", "Brand Match", "Face Consistency"],
    },
    references: [
      {
        id: 21,
        title: "Mirror outfit frame",
        vibe: "clean fashion",
        imageUrl: presetAsset("luna-vale", "Ref1.jpg"),
      },
      {
        id: 22,
        title: "Close mirror selfie",
        vibe: "soft premium",
        imageUrl: presetAsset("luna-vale", "Ref2.jpg"),
      },
      {
        id: 23,
        title: "City coffee walk",
        vibe: "casual chic",
        gradient: "linear-gradient(160deg,#0f1f37,#294d8b,#0d1731)",
      },
      {
        id: 24,
        title: "Night dinner look",
        vibe: "elevated lifestyle",
        gradient: "linear-gradient(160deg,#1b1226,#663779,#140d1f)",
      },
      {
        id: 25,
        title: "Studio portrait feel",
        vibe: "editorial",
        gradient: "linear-gradient(160deg,#15192a,#404b91,#111420)",
      },
    ],
  },
  {
    id: 3,
    presetId: "preset-mira-kline",
    name: "Mira Kline",
    handle: "@mira.kline",
    initials: "MK",
    badge: "91%",
    coverImageUrl: presetAsset("mira-kline", "Cover.png"),
    tags: ["Model", "Beauty"],
    chips: ["Luxury", "Brand-fit", "Niche-auth."],
    glowA: "rgba(236,72,153,.60)",
    glowB: "rgba(168,85,247,.40)",
    bg: "linear-gradient(170deg,#1a0a18 0%,#601040 40%,#3a0828 75%,#200a18 100%)",
    bio: "Luxury beauty and model persona with strong premium brand compatibility. Best for soft glam, beauty storytelling, confident portrait-led lifestyle content, and polished creator visuals.",
    bestFor: ["Beauty campaigns", "Luxury selfies", "Night-out content", "Soft glam storytelling"],
    category: "Beauty",
    niche: "Luxury / Personal Brand",
    recommended: {
      look: "Luxury Realism",
      motion: "Cinematic Social",
      strategy: "Conversion",
      priorities: ["Face Consistency", "Realism", "Brand Match"],
    },
    references: [
      {
        id: 31,
        title: "Restaurant candid",
        vibe: "quiet luxury",
        imageUrl: presetAsset("mira-kline", "Ref1.png"),
      },
      {
        id: 32,
        title: "Mirror glam prep",
        vibe: "beauty routine",
        imageUrl: presetAsset("mira-kline", "Ref2.jpeg"),
      },
      {
        id: 33,
        title: "Car selfie mood",
        vibe: "realistic luxury",
        gradient: "linear-gradient(160deg,#1a1530,#5b3bb8,#120f24)",
      },
      {
        id: 34,
        title: "Skincare counter",
        vibe: "soft beauty",
        gradient: "linear-gradient(160deg,#231221,#76456a,#180d15)",
      },
      {
        id: 35,
        title: "Dinner table close-up",
        vibe: "premium realism",
        gradient: "linear-gradient(160deg,#291411,#8f4730,#1a0d0c)",
      },
    ],
  },
  {
    id: 4,
    presetId: "preset-nova-reed",
    name: "Nova Reed",
    handle: "@nova.reed",
    initials: "NR",
    badge: "89%",
    tags: ["Tech", "Creator"],
    chips: ["Gen-Z", "Edu-tainment", "High reach"],
    glowA: "rgba(52,211,153,.50)",
    glowB: "rgba(59,130,246,.40)",
    bg: "linear-gradient(170deg,#081a18 0%,#0d4035 40%,#092a24 75%,#061510 100%)",
    bio: "Tech and creator-focused persona built for informative but social-native content. Great for software demos, growth tips, creator education, and modern productivity content.",
    bestFor: ["AI tutorials", "Productivity clips", "Tech creator reels", "Educational social posts"],
    category: "Tech",
    niche: "Education / Creator Economy",
    recommended: {
      look: "Phone Native",
      motion: "Balanced",
      strategy: "Community",
      priorities: ["Realism", "Trend Fit", "Hook Strength"],
    },
    references: [
      {
        id: 41,
        title: "Desk setup reel",
        vibe: "creator desk",
        gradient: "linear-gradient(160deg,#0c1d1a,#1f6d5f,#091311)",
      },
      {
        id: 42,
        title: "Laptop cafe shot",
        vibe: "remote work",
        gradient: "linear-gradient(160deg,#102030,#2c6d8a,#0a131b)",
      },
      {
        id: 43,
        title: "Direct-to-camera tip",
        vibe: "educational",
        gradient: "linear-gradient(160deg,#131f28,#2f5371,#0c141b)",
      },
      {
        id: 44,
        title: "Phone-native explainer",
        vibe: "social tech",
        gradient: "linear-gradient(160deg,#13251e,#366b4f,#0c1713)",
      },
      {
        id: 45,
        title: "Workspace story",
        vibe: "creator daily",
        gradient: "linear-gradient(160deg,#16212c,#425676,#0e141c)",
      },
    ],
  },
  {
    id: 5,
    presetId: "preset-zara-voss",
    name: "Zara Voss",
    handle: "@zara.voss",
    initials: "ZV",
    badge: "96%",
    tags: ["Luxury", "Travel"],
    chips: ["HNW audience", "Aspirational", "Collab-ready"],
    glowA: "rgba(251,191,36,.45)",
    glowB: "rgba(236,72,153,.38)",
    bg: "linear-gradient(170deg,#1a140a 0%,#604010 40%,#3a2808 75%,#201408 100%)",
    bio: "Aspirational luxury travel persona with strong premium visual fit. Works best for destination storytelling, boutique hotel content, dinner scenes, and elevated lifestyle campaigns.",
    bestFor: ["Travel reels", "Luxury hotel content", "Brunch and sunset stories", "Destination campaigns"],
    category: "Luxury",
    niche: "Travel / Aspirational Lifestyle",
    recommended: {
      look: "Luxury Realism",
      motion: "Cinematic Social",
      strategy: "Brand Safe",
      priorities: ["Brand Match", "Realism", "Face Consistency"],
    },
    references: [
      {
        id: 51,
        title: "Hotel balcony view",
        vibe: "luxury travel",
        gradient: "linear-gradient(160deg,#261b0f,#8f6521,#1b1209)",
      },
      {
        id: 52,
        title: "Sunset rooftop",
        vibe: "aspirational",
        gradient: "linear-gradient(160deg,#2c1523,#8b3f67,#1a0d15)",
      },
      {
        id: 53,
        title: "Dinner destination look",
        vibe: "premium lifestyle",
        gradient: "linear-gradient(160deg,#20170d,#7a5325,#140f08)",
      },
      {
        id: 54,
        title: "Airport lounge fit",
        vibe: "travel creator",
        gradient: "linear-gradient(160deg,#1a1e26,#5c6b84,#12141a)",
      },
      {
        id: 55,
        title: "Poolside phone moment",
        vibe: "vacation realism",
        gradient: "linear-gradient(160deg,#0f2122,#2d8084,#0b1616)",
      },
    ],
  },
  {
    id: 6,
    presetId: "preset-lina-vale",
    name: "Lina Vale",
    handle: "@lina.vale",
    initials: "LV",
    badge: "90%",
    coverImageUrl: presetAsset("lina-vale", "Cover.jpg"),
    tags: ["Lifestyle", "Beauty"],
    chips: ["Soft glam", "Premium", "Warm editorial"],
    glowA: "rgba(244,114,182,.48)",
    glowB: "rgba(251,191,36,.18)",
    bg: "linear-gradient(170deg,#221615 0%,#4a2c2a 36%,#2b1b1b 72%,#161012 100%)",
    bio: "Soft luxury lifestyle and beauty persona designed for polished, feminine, and premium-looking content. Best for warm indoor editorials, clean beauty visuals, refined lounge aesthetics, and elegant creator-style posts.",
    bestFor: [
      "Soft glam beauty content",
      "Warm indoor lifestyle reels",
      "Feminine editorial posts",
      "Premium lounge aesthetics",
    ],
    category: "Beauty",
    niche: "Soft Luxury / Feminine Editorial",
    recommended: {
      look: "Clean Editorial",
      motion: "Balanced",
      strategy: "Brand Safe",
      priorities: ["Realism", "Brand Match", "Face Consistency"],
    },
    references: [
      {
        id: 61,
        title: "Soft couch portrait",
        vibe: "warm editorial",
        imageUrl: presetAsset("lina-vale", "Ref1.jpg"),
      },
      {
        id: 62,
        title: "Luxury lounge angle",
        vibe: "soft premium",
        imageUrl: presetAsset("lina-vale", "Ref2.jpg"),
      },
      {
        id: 63,
        title: "Window light frame",
        vibe: "clean beauty",
        imageUrl: presetAsset("lina-vale", "Ref3.jpg"),
      },
      {
        id: 64,
        title: "Bedside morning mood",
        vibe: "quiet luxury",
        imageUrl: presetAsset("lina-vale", "Ref4.jpg"),
      },
      {
        id: 65,
        title: "Neutral luxe portrait",
        vibe: "feminine lifestyle",
        imageUrl: presetAsset("lina-vale", "Ref5.jpg"),
      },
    ],
  },
{
  id: 7,
  presetId: "preset-aria-noir",
  name: "Aria Noir",
  handle: "@aria.noir",
  initials: "AN",
  badge: "92%",
  coverImageUrl: presetAsset("aria-noir", "Cover.jpg"),
  tags: ["Luxury", "Beauty"],
  chips: ["Golden hour", "Editorial", "Premium"],
  glowA: "rgba(251,191,36,.34)",
  glowB: "rgba(244,114,182,.24)",
  bg: "linear-gradient(170deg,#20140f 0%,#4f3422 36%,#2d1c14 72%,#16100d 100%)",
  bio: "Luxury editorial persona designed for golden-hour beauty scenes, refined outdoor fashion campaigns, and premium feminine visuals with polished brand-safe glamour.",
  bestFor: [
    "Golden-hour editorials",
    "Luxury beauty campaigns",
    "Outdoor premium visuals",
    "Feminine brand storytelling",
  ],
  category: "Beauty",
  niche: "Luxury / Golden Hour Editorial",
  recommended: {
    look: "Luxury Realism",
    motion: "Cinematic Social",
    strategy: "Brand Safe",
    priorities: ["Realism", "Brand Match", "Face Consistency"],
  },
  references: [
    {
      id: 71,
      title: "Garden path portrait",
      vibe: "golden hour editorial",
      imageUrl: presetAsset("aria-noir", "Ref1.jpg"),
    },
    {
      id: 72,
      title: "Luxury outdoor frame",
      vibe: "soft premium",
      imageUrl: presetAsset("aria-noir", "Ref2.jpg"),
    },
    {
      id: 73,
      title: "Sunset campaign pose",
      vibe: "beauty campaign",
      imageUrl: presetAsset("aria-noir", "Ref3.jpg"),
    },
    {
      id: 74,
      title: "Refined garden look",
      vibe: "quiet luxury",
      imageUrl: presetAsset("aria-noir", "Ref4.jpg"),
    },
  ],
},
{
  id: 8,
  presetId: "preset-sera-monroe",
  name: "Sera Monroe",
  handle: "@sera.monroe",
  initials: "SM",
  badge: "95%",
  coverImageUrl: presetAsset("sera-monroe", "Cover.jpg"),
  tags: ["Luxury", "Lifestyle"],
  chips: ["Pink glam", "Rich-girl", "Brand-safe"],
  glowA: "rgba(244,114,182,.38)",
  glowB: "rgba(251,191,36,.22)",
  bg: "linear-gradient(170deg,#1f1418 0%,#4d2330 36%,#2b171e 72%,#140e12 100%)",
  bio: "Luxury lifestyle persona built for high-end city visuals, soft glam fashion moments, premium automotive aesthetics, and aspirational social content with strong commercial appeal.",
  bestFor: [
    "Luxury city content",
    "Soft glam lifestyle reels",
    "Aspirational fashion posts",
    "Premium brand collaborations",
  ],
  category: "Luxury",
  niche: "Soft Glam / Rich Girl Lifestyle",
  recommended: {
    look: "Luxury Realism",
    motion: "Cinematic Social",
    strategy: "Brand Safe",
    priorities: ["Brand Match", "Realism", "Face Consistency"],
  },
  references: [
    {
      id: 81,
      title: "Pink supercar arrival",
      vibe: "luxury street style",
      imageUrl: presetAsset("sera-monroe", "Ref1.jpg"),
    },
    {
      id: 82,
      title: "Designer district stop",
      vibe: "rich girl aesthetic",
      imageUrl: presetAsset("sera-monroe", "Ref2.jpg"),
    },
    {
      id: 83,
      title: "Soft glam city moment",
      vibe: "premium lifestyle",
      imageUrl: presetAsset("sera-monroe", "Ref3.jpg"),
    },
  ],
},
];
