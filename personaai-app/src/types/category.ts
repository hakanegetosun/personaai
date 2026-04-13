export const CATEGORY_VALUES = [
  "gym_fitness",
  "fashion_moda",
  "beauty_skincare",
  "lifestyle",
  "travel",
  "food_culinary",
  "wellness_selfcare",
] as const;

export type InfluencerCategory = (typeof CATEGORY_VALUES)[number];

export type CategoryOption = {
  value: InfluencerCategory;
  label: string;
  description: string;
};

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "gym_fitness",
    label: "Gym / Fitness",
    description: "Workout, transformations, routines, prep, discipline.",
  },
  {
    value: "fashion_moda",
    label: "Fashion / Moda",
    description: "OOTD, styling, mirror looks, seasonal trends, luxury vibe.",
  },
  {
    value: "beauty_skincare",
    label: "Beauty / Skincare",
    description: "Glow-up, skincare routines, makeup detail, close-up beauty content.",
  },
  {
    value: "lifestyle",
    label: "Lifestyle",
    description: "Daily life, routines, cozy moments, self-branding and relatable content.",
  },
  {
    value: "travel",
    label: "Travel",
    description: "Destination mood, hotel scenes, airport looks, scenic storytelling.",
  },
  {
    value: "food_culinary",
    label: "Food & Culinary",
    description: "Recipes, plating, kitchen moments, indulgent food visuals, creator-style dining.",
  },
  {
    value: "wellness_selfcare",
    label: "Wellness & Self-Care",
    description: "Mindfulness, routines, recovery, calm luxury, health-forward creator content.",
  },
];

export function isInfluencerCategory(value: unknown): value is InfluencerCategory {
  return typeof value === "string" && CATEGORY_VALUES.includes(value as InfluencerCategory);
}
