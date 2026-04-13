import type { InfluencerCategory } from "@/types/category";

export type CalendarRowInput = {
  day_number: number;
  content_date: string;
  content_type: "story" | "reel" | "post";
  category: InfluencerCategory;
  title: string;
  hook: string;
  caption: string;
  status: "planned";
};

const CATEGORY_CONTENT_BANK: Record<
  InfluencerCategory,
  {
    story: Array<{ title: string; hook: string; caption: string }>;
    reel: Array<{ title: string; hook: string; caption: string }>;
    post: Array<{ title: string; hook: string; caption: string }>;
  }
> = {
  gym_fitness: {
    story: [
      {
        title: "Morning training check-in",
        hook: "Discipline first. Feelings second.",
        caption: "A fast morning story built around training consistency, energy, and routine.",
      },
      {
        title: "Pre-workout ritual",
        hook: "This is how the session starts.",
        caption: "Supplements, mindset, and small prep moments before the work begins.",
      },
      {
        title: "Post-lift reset",
        hook: "Earned, not chased.",
        caption: "A recovery-focused story moment with confidence, routine, and clean structure.",
      },
      {
        title: "Meal prep story",
        hook: "Results love repetition.",
        caption: "A simple nutrition story built around protein, consistency, and creator discipline.",
      },
      {
        title: "Gym mirror energy",
        hook: "Quiet work. Visible results.",
        caption: "A polished gym check-in story with strong visual identity and progress mood.",
      },
    ],
    reel: [
      {
        title: "Upper body training reel",
        hook: "This is what consistency looks like.",
        caption: "A high-energy reel built around form, rhythm, effort, and visual payoff.",
      },
      {
        title: "Leg day sequence",
        hook: "The work nobody can fake.",
        caption: "A powerful training flow with intensity, structure, and transformation energy.",
      },
      {
        title: "Transformation-style performance reel",
        hook: "Small reps become visible change.",
        caption: "A gym reel that sells discipline, aesthetics, and long-term creator identity.",
      },
      {
        title: "Workout routine edit",
        hook: "Same standard. Every session.",
        caption: "A repeatable fitness content concept focused on routine and strong movement.",
      },
      {
        title: "Recovery and training balance reel",
        hook: "Performance needs recovery too.",
        caption: "A more rounded performance reel that mixes movement with reset and control.",
      },
    ],
    post: [
      {
        title: "Physique progress post",
        hook: "Built through repetition.",
        caption: "A strong static post focused on body confidence, discipline, and long-game results.",
      },
      {
        title: "Gym portrait post",
        hook: "Strength has a look.",
        caption: "A premium fitness portrait concept designed for clean feed presence and authority.",
      },
      {
        title: "Routine and nutrition post",
        hook: "Results start before the session.",
        caption: "A creator-style post built around food, routine, and consistency-based positioning.",
      },
      {
        title: "Progress mindset post",
        hook: "The work changes more than your body.",
        caption: "A post concept mixing fitness visuals with identity and discipline messaging.",
      },
    ],
  },
  fashion_moda: {
    story: [
      {
        title: "OOTD story",
        hook: "One look. Full mood.",
        caption: "A refined outfit story with silhouette, luxury detail, and styling mood.",
      },
      {
        title: "Accessory detail story",
        hook: "Small details finish the whole look.",
        caption: "Close-up story content focused on jewelry, texture, and styling polish.",
      },
      {
        title: "Mirror fit check",
        hook: "Today’s look needed its own moment.",
        caption: "A clean mirror-based story with confidence, posture, and elevated styling.",
      },
      {
        title: "Closet mood story",
        hook: "Every good look starts before the final outfit.",
        caption: "A fashion creator story built around selection, curation, and taste.",
      },
      {
        title: "Color palette story",
        hook: "Tone changes everything.",
        caption: "A visual fashion story focused on coordinated pieces and premium color direction.",
      },
    ],
    reel: [
      {
        title: "Three-look styling reel",
        hook: "One base. Three elevated outcomes.",
        caption: "A styling reel built for clean transitions, polish, and editorial fashion flow.",
      },
      {
        title: "Luxury outfit reveal",
        hook: "This look was made for the camera.",
        caption: "A sleek outfit reel with emphasis on silhouette, pacing, and premium motion.",
      },
      {
        title: "Wardrobe switch reel",
        hook: "Style is in the choices.",
        caption: "A creator-fashion reel structured around contrast, selection, and refined mood.",
      },
      {
        title: "Fashion movement reel",
        hook: "A fit should move as well as it looks.",
        caption: "A reel concept centered on walking shots, fabric motion, and visual elegance.",
      },
      {
        title: "Seasonal styling reel",
        hook: "This season has a new standard.",
        caption: "A fashion-forward reel with seasonal direction and elevated creator energy.",
      },
    ],
    post: [
      {
        title: "Editorial fashion post",
        hook: "Style gets stronger when the frame is clean.",
        caption: "A polished static post built around luxury composition and sharp styling presence.",
      },
      {
        title: "Mirror portrait post",
        hook: "Minimal pose. Maximum presence.",
        caption: "A premium fashion portrait for feed identity, confidence, and aesthetic consistency.",
      },
      {
        title: "Detail-focused outfit post",
        hook: "The look lives in the details.",
        caption: "A static fashion concept highlighting texture, accessories, and editorial sharpness.",
      },
      {
        title: "Street-luxury post",
        hook: "Quiet luxury still needs edge.",
        caption: "A modern fashion post designed to balance soft elegance with creator attitude.",
      },
    ],
  },
  beauty_skincare: {
    story: [
      {
        title: "Morning skin prep story",
        hook: "Healthy glow starts before makeup.",
        caption: "A skincare-first story with hydration, barrier support, and soft visual detail.",
      },
      {
        title: "Product ritual story",
        hook: "This is the step that changes everything.",
        caption: "A ritual-focused beauty story made for trust, texture, and intimacy.",
      },
      {
        title: "Makeup desk story",
        hook: "The setup is part of the aesthetic.",
        caption: "A creator beauty story around tools, tones, and polished prep.",
      },
      {
        title: "Glow check story",
        hook: "Fresh skin hits different in natural light.",
        caption: "A soft skin-focused story for radiance, realism, and beauty mood.",
      },
      {
        title: "Night reset story",
        hook: "The routine ends the way it started: intentionally.",
        caption: "An end-of-day skincare story shaped around calm, softness, and premium ritual.",
      },
    ],
    reel: [
      {
        title: "Glow routine reel",
        hook: "This is what expensive-looking skin feels like.",
        caption: "A beauty reel focused on prep, blend, finish, and luminous visual payoff.",
      },
      {
        title: "Close-up makeup reel",
        hook: "Soft glam, sharper result.",
        caption: "A refined beauty edit for close detail, texture, and premium finish.",
      },
      {
        title: "Skincare ritual reel",
        hook: "Good skin is built in layers.",
        caption: "A creator beauty reel centered on touch, sequence, and calm ritual pacing.",
      },
      {
        title: "Before and after beauty reel",
        hook: "The difference is all in the finish.",
        caption: "A visual transformation reel built around clean refinement, not overdone drama.",
      },
      {
        title: "Luxury vanity reel",
        hook: "Beauty is also about how it’s presented.",
        caption: "A beauty creator concept mixing products, setup, and polished creator identity.",
      },
    ],
    post: [
      {
        title: "Glass-skin portrait post",
        hook: "Soft light, clean skin, strong beauty identity.",
        caption: "A static beauty portrait built for close-up trust and premium visual appeal.",
      },
      {
        title: "Skincare shelf post",
        hook: "The routine is part of the brand.",
        caption: "A feed post focused on beauty curation, product mood, and aesthetic consistency.",
      },
      {
        title: "Makeup finish post",
        hook: "The glow sits in the details.",
        caption: "A clean beauty post designed around finish, texture, and refined minimal glamour.",
      },
      {
        title: "Beauty identity post",
        hook: "The face is the frame. The routine is the story.",
        caption: "A premium creator beauty post built around elegance and skin-first confidence.",
      },
    ],
  },
  lifestyle: {
    story: [
      {
        title: "Slow morning story",
        hook: "Romanticize the routine.",
        caption: "A calm lifestyle story built around coffee, notes, light, and softness.",
      },
      {
        title: "Workspace story",
        hook: "The vibe starts before the work.",
        caption: "A daily creator story focused on atmosphere, setup, and visual calm.",
      },
      {
        title: "Day rhythm story",
        hook: "Small details shape the whole day.",
        caption: "A story moment about movement, routine, and soft lifestyle intention.",
      },
      {
        title: "Evening reset story",
        hook: "The reset matters too.",
        caption: "A lifestyle story built around a graceful slowdown, care, and creator calm.",
      },
      {
        title: "Coffee and mood story",
        hook: "Some moments don’t need much. Just intention.",
        caption: "A light daily story concept for warmth, aesthetic presence, and relatability.",
      },
    ],
    reel: [
      {
        title: "Day-in-the-life reel",
        hook: "The little things build the whole vibe.",
        caption: "A lifestyle reel designed around sequence, softness, and aspirational realism.",
      },
      {
        title: "Routine flow reel",
        hook: "This is what calm structure looks like.",
        caption: "A polished lifestyle concept mixing movement, detail, and visual consistency.",
      },
      {
        title: "Home atmosphere reel",
        hook: "Your environment is part of your content identity.",
        caption: "A creator-lifestyle reel focused on home textures, setup, and quiet luxury mood.",
      },
      {
        title: "Soft productivity reel",
        hook: "A productive day can still look beautiful.",
        caption: "A refined reel built around intention, space, and premium routine aesthetics.",
      },
      {
        title: "Weekend mood reel",
        hook: "The pace changes, the aesthetic stays.",
        caption: "A lifestyle reel centered on softness, pacing, and curated calm.",
      },
    ],
    post: [
      {
        title: "Lifestyle portrait post",
        hook: "A calm image can still hold presence.",
        caption: "A premium static post built around soft composition and aspirational ease.",
      },
      {
        title: "Workspace detail post",
        hook: "The setup says more than the caption.",
        caption: "A feed post focused on curation, productivity mood, and visual identity.",
      },
      {
        title: "Daily ritual post",
        hook: "Consistency also has an aesthetic.",
        caption: "A lifestyle feed concept blending realism with polished creator positioning.",
      },
      {
        title: "Quiet luxury lifestyle post",
        hook: "Soft doesn’t mean forgettable.",
        caption: "A static creator post for subtle elegance, routine, and aesthetic trust.",
      },
    ],
  },
  travel: {
    story: [
      {
        title: "Airport mood story",
        hook: "Catch the mood before the destination.",
        caption: "A travel story built around movement, anticipation, and visual polish.",
      },
      {
        title: "Hotel arrival story",
        hook: "The stay starts with the first impression.",
        caption: "A premium arrival story focused on interiors, calm, and destination tone.",
      },
      {
        title: "Golden hour travel story",
        hook: "This light deserved its own frame.",
        caption: "A travel creator story designed around atmosphere and place-based mood.",
      },
      {
        title: "Transit detail story",
        hook: "The in-between moments matter too.",
        caption: "A movement-focused travel story built around pace, transition, and aesthetic flow.",
      },
      {
        title: "View check story",
        hook: "Some locations do the work for you.",
        caption: "A destination story built around scenery, calm luxury, and visual impact.",
      },
    ],
    reel: [
      {
        title: "Destination cinematic reel",
        hook: "This place deserved more than a simple clip.",
        caption: "A cinematic travel reel with movement, architecture, and destination payoff.",
      },
      {
        title: "Hotel and city reel",
        hook: "From check-in to city light.",
        caption: "A premium travel sequence focused on transitions, interiors, and urban atmosphere.",
      },
      {
        title: "Travel diary reel",
        hook: "The route is part of the story.",
        caption: "A creator-style travel reel shaped around movement, pacing, and beautiful context.",
      },
      {
        title: "Vacation rhythm reel",
        hook: "The mood changed the moment we landed.",
        caption: "A soft but elevated travel reel for memory, motion, and visual escape.",
      },
      {
        title: "Scenic arrival reel",
        hook: "This is how a location earns attention.",
        caption: "A destination-first reel built around visual reveal and cinematic framing.",
      },
    ],
    post: [
      {
        title: "Destination portrait post",
        hook: "The setting changes everything.",
        caption: "A polished travel portrait built around scenery, outfit, and premium composition.",
      },
      {
        title: "Hotel mood post",
        hook: "The stay deserves a place in the feed too.",
        caption: "A static travel post focused on design, atmosphere, and elevated travel identity.",
      },
      {
        title: "Travel aesthetic post",
        hook: "Movement looks better when the frame is intentional.",
        caption: "A feed post blending travel mood, styling, and strong creator presentation.",
      },
      {
        title: "Scenic still post",
        hook: "Some places speak in still frames.",
        caption: "A location-driven post built around composition, environment, and quiet impact.",
      },
    ],
  },
  food_culinary: {
    story: [
      {
        title: "Kitchen prep story",
        hook: "Good taste starts before the plate.",
        caption: "A culinary story built around setup, ingredients, and anticipation.",
      },
      {
        title: "Plating detail story",
        hook: "The finish is part of the flavor.",
        caption: "A close-up food story designed around detail, texture, and creator appetite.",
      },
      {
        title: "Table moment story",
        hook: "This deserved a pause before the first bite.",
        caption: "A premium dining story built around atmosphere, presentation, and indulgence.",
      },
      {
        title: "Ingredient mood story",
        hook: "The visual starts before the recipe does.",
        caption: "A food story centered on freshness, composition, and culinary tone.",
      },
      {
        title: "Texture close-up story",
        hook: "This is the part that makes people hungry.",
        caption: "A sensory story concept focused on richness, detail, and appetite-trigger visuals.",
      },
    ],
    reel: [
      {
        title: "Plating reel",
        hook: "This is what people mean by visual appetite.",
        caption: "A culinary reel focused on motion, richness, and plating payoff.",
      },
      {
        title: "Recipe moment reel",
        hook: "The process looks as good as the result.",
        caption: "A food reel built around sequence, texture, and satisfying visual rhythm.",
      },
      {
        title: "Dining reel",
        hook: "A meal can feel cinematic too.",
        caption: "A premium food creator reel blending environment, detail, and indulgent atmosphere.",
      },
      {
        title: "Close-up culinary reel",
        hook: "This is the shot that makes people stop.",
        caption: "A detail-first culinary reel for richness, contrast, and creator polish.",
      },
      {
        title: "Food styling reel",
        hook: "Presentation changes everything.",
        caption: "A creator-food sequence built around styling, plating, and premium sensory appeal.",
      },
    ],
    post: [
      {
        title: "Signature plate post",
        hook: "A still frame can carry flavor too.",
        caption: "A food portrait post focused on plating, richness, and visual craving.",
      },
      {
        title: "Tabletop composition post",
        hook: "The scene matters as much as the dish.",
        caption: "A static culinary concept built around mood, color, and premium food presentation.",
      },
      {
        title: "Ingredient post",
        hook: "The appetite starts in the details.",
        caption: "A refined food post that highlights freshness, quality, and visual appetite.",
      },
      {
        title: "Dining aesthetic post",
        hook: "Taste is also visual.",
        caption: "A creator-food post designed to make the feed feel richer, warmer, and more indulgent.",
      },
    ],
  },
  wellness_selfcare: {
    story: [
      {
        title: "Morning reset story",
        hook: "Reset your energy, not just your schedule.",
        caption: "A wellness story focused on calm pacing, breath, and intentional start-of-day energy.",
      },
      {
        title: "Hydration and routine story",
        hook: "The smallest habits change the whole feeling.",
        caption: "A self-care story built around softness, hydration, and gentle structure.",
      },
      {
        title: "Wellness desk story",
        hook: "A calm environment supports the whole routine.",
        caption: "A clean creator story centered on peace, setup, and balanced flow.",
      },
      {
        title: "Evening self-care story",
        hook: "A better reset begins here.",
        caption: "A quiet luxury self-care story built around restoration and softness.",
      },
      {
        title: "Mindful moment story",
        hook: "Stillness is part of the rhythm too.",
        caption: "A wellness-first story designed around reflection, simplicity, and calm presence.",
      },
    ],
    reel: [
      {
        title: "Self-care ritual reel",
        hook: "Soft routines can still feel powerful.",
        caption: "A wellness reel blending skincare, reset, and luxury calm into one visual flow.",
      },
      {
        title: "Wellness morning reel",
        hook: "This is what a grounded start looks like.",
        caption: "A morning wellness sequence shaped around ease, light, and balanced energy.",
      },
      {
        title: "Recovery reel",
        hook: "Recovery is part of the performance.",
        caption: "A wellness concept built around gentle movement, calm visuals, and restoration.",
      },
      {
        title: "Calm luxury reel",
        hook: "Peace can be part of the aesthetic too.",
        caption: "A beauty-meets-wellness reel for premium self-care and restorative creator identity.",
      },
      {
        title: "Wellness lifestyle reel",
        hook: "A better pace changes the whole tone.",
        caption: "A self-care reel built around consistency, softness, and elevated daily reset.",
      },
    ],
    post: [
      {
        title: "Self-care portrait post",
        hook: "Softness can still hold presence.",
        caption: "A static wellness portrait built around clean calm, beauty, and inner balance.",
      },
      {
        title: "Routine essentials post",
        hook: "What supports you becomes part of your identity.",
        caption: "A wellness feed post focused on products, mood, and restorative atmosphere.",
      },
      {
        title: "Calm aesthetic post",
        hook: "Peace looks good when it’s intentional.",
        caption: "A still wellness concept designed around space, quiet luxury, and reset energy.",
      },
      {
        title: "Mindful lifestyle post",
        hook: "The way you pause matters too.",
        caption: "A refined static post for slow living, self-care, and elevated balance.",
      },
    ],
  },
};

const CONTENT_PATTERN: Array<"story" | "reel" | "post"> = [
  "story",
  "reel",
  "post",
  "story",
  "reel",
  "story",
  "post",
  "reel",
  "story",
  "post",
];

function formatDateUTC(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysUTC(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getMonthStartUTC(input?: Date): Date {
  const base = input ?? new Date();
  return new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1));
}

export function generateMonthlyCalendar(
  category: InfluencerCategory,
  monthStart?: Date
): CalendarRowInput[] {
  const bank = CATEGORY_CONTENT_BANK[category];
  const start = getMonthStartUTC(monthStart);

  const rows: CalendarRowInput[] = [];

  for (let i = 0; i < 30; i += 1) {
    const dayNumber = i + 1;
    const contentType = CONTENT_PATTERN[i % CONTENT_PATTERN.length];
    const itemBank = bank[contentType];
    const item = itemBank[i % itemBank.length];
    const contentDate = addDaysUTC(start, i);

    rows.push({
      day_number: dayNumber,
      content_date: formatDateUTC(contentDate),
      content_type: contentType,
      category,
      title: item.title,
      hook: item.hook,
      caption: item.caption,
      status: "planned",
    });
  }

  return rows;
}

export function getCalendarMonthString(monthStart?: Date): string {
  return formatDateUTC(getMonthStartUTC(monthStart));
}
