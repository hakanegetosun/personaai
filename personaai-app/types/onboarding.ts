export const CATEGORY_VALUES = [
  "gym_fitness",
  "fashion_moda",
  "beauty_skincare",
  "lifestyle",
  "travel",
  "food_culinary",
  "wellness_selfcare",
] as const;

export type CreatorCategory = (typeof CATEGORY_VALUES)[number];

export type CategoryOption = {
  value: CreatorCategory;
  label: string;
  subtitle: string;
  emoji: string;
};

export type BasicInfoForm = {
  name: string;
  age: string;
};

export type PreviewContent = {
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

export const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: "gym_fitness",
    label: "Gym / Fitness",
    subtitle: "Performance, discipline, transformation",
    emoji: "🏋️",
  },
  {
    value: "fashion_moda",
    label: "Fashion / Moda",
    subtitle: "Style, luxury, outfit storytelling",
    emoji: "👗",
  },
  {
    value: "beauty_skincare",
    label: "Beauty / Skincare",
    subtitle: "Glow, ritual, beauty content",
    emoji: "✨",
  },
  {
    value: "lifestyle",
    label: "Lifestyle",
    subtitle: "Daily moments, soft aspirational content",
    emoji: "🌿",
  },
  {
    value: "travel",
    label: "Travel",
    subtitle: "Destinations, movement, exploration",
    emoji: "✈️",
  },
  {
    value: "food_culinary",
    label: "Food & Culinary",
    subtitle: "Taste, plating, indulgent visuals",
    emoji: "🍽️",
  },
  {
    value: "wellness_selfcare",
    label: "Wellness & Self-Care",
    subtitle: "Balance, reset, mindful routines",
    emoji: "🧘",
  },
];
