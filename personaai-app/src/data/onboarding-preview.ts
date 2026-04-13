import type { InfluencerCategory } from "@/types/category";

export type OnboardingPreview = {
  story: {
    title: string;
    hook: string;
    caption: string;
  };
  reel: {
    title: string;
    hook: string;
    caption: string;
  };
};

export const ONBOARDING_PREVIEW_BY_CATEGORY: Record<
  InfluencerCategory,
  OnboardingPreview
> = {
  gym_fitness: {
    story: {
      title: "Morning Training Story",
      hook: "Discipline beats motivation every time.",
      caption:
        "6:30 AM lift, clean fuel, no excuses. A strong creator brand starts with consistent habits.",
    },
    reel: {
      title: "Workout Reel Preview",
      hook: "This is what consistency looks like.",
      caption:
        "A polished performance edit with gym rhythm, strength visuals, and transformation energy.",
    },
  },
  fashion_moda: {
    story: {
      title: "OOTD Story",
      hook: "One look. Full mood.",
      caption:
        "A refined daily fit built around silhouette, texture, and premium styling details.",
    },
    reel: {
      title: "Styling Reel Preview",
      hook: "Turn one outfit into three elevated looks.",
      caption:
        "A fashion-forward visual flow designed for polished transitions and editorial presence.",
    },
  },
  beauty_skincare: {
    story: {
      title: "Skincare Story",
      hook: "Healthy glow starts before makeup.",
      caption:
        "Hydration, prep, and skin-first beauty content designed for soft close-up storytelling.",
    },
    reel: {
      title: "Beauty Reel Preview",
      hook: "This routine looks expensive on camera.",
      caption:
        "A glow-focused beauty sequence with premium ritual energy and clean detail shots.",
    },
  },
  lifestyle: {
    story: {
      title: "Daily Lifestyle Story",
      hook: "Romanticize the routine.",
      caption:
        "Coffee, notes, light, and calm elevated moments that make everyday life feel curated.",
    },
    reel: {
      title: "Lifestyle Reel Preview",
      hook: "The small details build the whole vibe.",
      caption:
        "An aspirational day-in-the-life style concept with warm visual flow and creator polish.",
    },
  },
  travel: {
    story: {
      title: "Travel Story",
      hook: "Catch the mood before the destination.",
      caption:
        "Airport fit, hotel arrival, and destination atmosphere with clean visual storytelling.",
    },
    reel: {
      title: "Travel Reel Preview",
      hook: "This destination deserved a cinematic edit.",
      caption:
        "A premium travel sequence built around movement, architecture, and arrival energy.",
    },
  },
  food_culinary: {
    story: {
      title: "Food Story",
      hook: "Good taste should look this good.",
      caption:
        "Texture, plating, and close-up indulgence made for irresistible creator-first food content.",
    },
    reel: {
      title: "Culinary Reel Preview",
      hook: "This is the kind of food content people rewatch.",
      caption:
        "A sensory food edit shaped around richness, motion, and visual appetite.",
    },
  },
  wellness_selfcare: {
    story: {
      title: "Wellness Story",
      hook: "Reset your energy, not just your schedule.",
      caption:
        "A calm luxury self-care moment built around softness, recovery, and clean rituals.",
    },
    reel: {
      title: "Wellness Reel Preview",
      hook: "Soft routines can still feel powerful.",
      caption:
        "A refined wellness sequence with mindful motion, skincare calm, and restorative mood.",
    },
  },
};
