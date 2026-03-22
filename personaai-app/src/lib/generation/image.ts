import { fal } from "@fal-ai/client";

type TrendSignalsInput = {
  hooks?: string[];
  audioMoods?: string[];
  formats?: string[];
  shotPatterns?: string[];
  ctas?: string[];
  hashtags?: string[];
  summary?: string[];
} | null;

type SmartControlsInput = {
  strategy?: string | null;
  look?: string | null;
  motion?: string | null;
  priorities?: string[] | null;
  customNote?: string | null;
} | null;

export type ImageGenerationInput = {
  personaName?: string;
  contentType: "post" | "story";
  referenceImageUrl?: string | null;
  referenceImageUrls?: string[];
  niche?: string | null;
  style?: string | null;
  personality?: string | null;
  advancedNotes?: string | null;
  brandDirection?: string | null;
  brandKeywords?: string | null;
  visualDoNotUse?: string | null;
  planTitle?: string | null;
  planDay?: string | null;
  planType?: string | null;

trendSignals?: TrendSignalsInput;

smartControls?: {
  strategy?: string | null;
  look?: string | null;
  motion?: string | null;
  priorities?: string[] | null;
  customNote?: string | null;
} | null;

smartControlsPromptBlock?: string | null;
identityLock?: boolean;
allureMode?: boolean;
};

export type ImageGenerationResult = {
  imageUrl: string;
  thumbnailUrl: string;
  promptUsed: string;
  usedReferenceFace: boolean;
};

type PromptRecipe = {
  shortTitle: string;
  scene: string;
  framing: string;
  activity: string;
  mood: string;
  stylingNotes: string;
  negativeNotes: string;
};

const falKey = process.env.FAL_KEY;
const openaiKey = process.env.OPENAI_API_KEY;

if (!falKey) {
  console.warn("Missing FAL_KEY environment variable.");
} else {
  fal.config({
    credentials: falKey,
  });
}

function getImageSize(
  contentType: "post" | "story"
): "square_hd" | "portrait_16_9" {
  return contentType === "post" ? "square_hd" : "portrait_16_9";
}

function uniqueTop(items: Array<string | null | undefined>, limit = 6): string[] {
  return [...new Set(items.map((x) => (x ?? "").trim()).filter(Boolean))].slice(0, limit);
}

function normalizeTrendSignals(trendSignals?: TrendSignalsInput) {
  return {
    hooks: uniqueTop(trendSignals?.hooks ?? [], 4),
    audioMoods: uniqueTop(trendSignals?.audioMoods ?? [], 3),
    formats: uniqueTop(trendSignals?.formats ?? [], 4),
    shotPatterns: uniqueTop(trendSignals?.shotPatterns ?? [], 4),
    ctas: uniqueTop(trendSignals?.ctas ?? [], 4),
    hashtags: uniqueTop(trendSignals?.hashtags ?? [], 6),
    summary: uniqueTop(trendSignals?.summary ?? [], 5),
  };
}

function hasTrendSignals(trendSignals?: TrendSignalsInput): boolean {
  const normalized = normalizeTrendSignals(trendSignals);

  return (
    normalized.hooks.length > 0 ||
    normalized.audioMoods.length > 0 ||
    normalized.formats.length > 0 ||
    normalized.shotPatterns.length > 0 ||
    normalized.ctas.length > 0 ||
    normalized.hashtags.length > 0 ||
    normalized.summary.length > 0
  );
}

function buildTrendAwareHints(input: ImageGenerationInput) {
  const trend = normalizeTrendSignals(input.trendSignals);

  const primaryFormat = trend.formats[0] ?? null;
  const primaryHook = trend.hooks[0] ?? null;
  const primaryShotPattern = trend.shotPatterns[0] ?? null;
  const primaryAudioMood = trend.audioMoods[0] ?? null;
  const primaryCTA = trend.ctas[0] ?? null;

  return {
    primaryFormat,
    primaryHook,
    primaryShotPattern,
    primaryAudioMood,
    primaryCTA,
    trendSummaryText:
      trend.summary.length > 0 ? trend.summary.join(" | ") : null,
    hashtagText:
      trend.hashtags.length > 0 ? trend.hashtags.join(", ") : null,
    trendInfluenceInstruction: hasTrendSignals(input.trendSignals)
      ? "Use current viral social patterns only as subtle composition and storytelling guidance. Persona identity, face consistency, realism, and brand fit are more important than chasing trends aggressively."
      : null,
  };
}

function buildFallbackRecipe(input: ImageGenerationInput): PromptRecipe {
  const niche = input.niche?.toLowerCase() ?? "";
  const style = input.style ?? "premium social aesthetic";
  const personality = input.personality ?? "confident and natural";
  const trendHints = buildTrendAwareHints(input);

  let scene =
    "a believable everyday lifestyle environment with natural background depth and real-life details";
  let activity =
    "captured in a candid real-life moment, mid-action, naturally interacting with the environment, not posing directly for camera";
  let framing =
    input.contentType === "story"
      ? "vertical lifestyle composition, medium shot or full-body shot, natural candid framing, not extreme close-up"
      : "balanced social post composition, medium shot or full-body shot, natural candid framing, not extreme close-up";

  if (niche === "fitness") {
    scene =
      "a realistic premium gym interior with visible equipment, mirrors, corners, and natural depth";
    activity =
      "mid-workout candid moment, adjusting equipment, holding a shaker, sitting between sets, checking phone, tying hair, or walking through the gym naturally";
  } else if (niche === "fashion") {
    scene =
      "a stylish city street, boutique area, mirror corner, elevator mirror, or chic cafe with real-life texture";
    activity =
      "walking naturally, candid mirror moment, adjusting outfit, checking phone, or captured casually in motion";
  } else if (niche === "travel") {
    scene =
      "a scenic outdoor destination, elegant resort, rooftop, beach path, or beautiful city viewpoint";
    activity =
      "walking, looking at the view, fixing hair in the wind, holding coffee, or naturally enjoying the location";
  } else if (niche === "luxury lifestyle" || niche === "lifestyle") {
    scene =
      "a refined cafe, hotel lobby, terrace, modern restaurant, or premium street scene with lived-in realism";
    activity =
      "having coffee, checking laptop, walking naturally, looking out the window, mid-conversation, or caught in an everyday candid moment";
  } else if (niche === "business") {
    scene =
      "a realistic cafe workspace, hotel lobby, coworking corner, or city business setting";
    activity =
      "working on laptop, checking notes, walking with coffee, sitting in a candid work moment, or mid-task naturally";
  }

  if (trendHints.primaryShotPattern) {
    framing = `${framing}, inspired by ${trendHints.primaryShotPattern} but still natural and believable`;
  }

  const stylingBits = [
    style,
    "realistic styling",
    "premium creator content",
    "social-media-ready but believable",
    trendHints.primaryFormat ? `format influence: ${trendHints.primaryFormat}` : null,
    trendHints.primaryAudioMood ? `visual pacing mood inspired by ${trendHints.primaryAudioMood}` : null,
  ];

  const negativeBits = [
    "not a passport photo",
    "not a studio headshot",
    "not beauty close-up only",
    "no face distortion",
    "no identity drift",
    "no cinematic perfection",
    "no glossy AI skin",
    "no over-stylized editorial composition",
    "no artificial symmetry",
    "no plastic skin texture",
  ];

  return {
    shortTitle: input.contentType === "story" ? "Lifestyle Story" : "Lifestyle Post",
    scene,
    framing,
    activity,
    mood: personality,
    stylingNotes: stylingBits.filter(Boolean).join(", "),
    negativeNotes: negativeBits.join(", "),
  };
}

async function generatePromptRecipeWithOpenAI(
  input: ImageGenerationInput
): Promise<PromptRecipe> {
  if (!openaiKey) {
    return buildFallbackRecipe(input);
  }

  const trend = normalizeTrendSignals(input.trendSignals);

  const system = [
    "You create highly realistic social-media image concepts.",
    "Return strict JSON only.",
    "The image must feel like a believable social media moment, not an AI beauty portrait.",
    "Avoid repetitive close-up portraits.",
    "Favor lifestyle scenes, storytelling, activities, believable environments, and natural framing.",
    "Preserve identity consistency across outputs.",
    "Prioritize candid realism over cinematic perfection.",
    "Use current trend signals only as light guidance, never as overpowering direction.",
    "The result must feel creator-native, phone-native, and socially believable.",
  ].join(" ");

  const user = {
goal: "Create one realistic image of the exact same recurring AI persona without changing identity.",
    constraints: {
      contentType: input.contentType,
      personaName: input.personaName ?? null,
      niche: input.niche ?? null,
      style: input.style ?? null,
      personality: input.personality ?? null,
      planTitle: input.planTitle ?? null,
      planDay: input.planDay ?? null,
      planType: input.planType ?? null,
      advancedNotes: input.advancedNotes ?? null,
      brandDirection: input.brandDirection ?? null,
      brandKeywords: input.brandKeywords ?? null,
      visualDoNotUse: input.visualDoNotUse ?? null,
      referenceFaceProvided: Boolean(input.referenceImageUrl || input.referenceImageUrls?.length),
      mustPreserveIdentity: true,
identityLock: input.identityLock ?? true,
allureMode: input.allureMode ?? false,
beautyDirection:
  input.allureMode
    ? "Keep the exact same identity, but present her in a more premium, magnetic, polished, high-appeal creator style. She should feel elegant, desirable, socially compelling, tastefully alluring, and visually striking without looking fake, plastic, or overprocessed."
    : "Keep the exact same identity and present her in a realistic, socially believable, attractive, polished way.",
identityRule:
  "The reference image is the identity anchor and defines the exact same person. Preserve the exact same face, facial proportions, eyes, nose, lips, jawline, cheek structure, age impression, and overall beauty identity. Do not reinterpret the face. Do not beautify by changing the person. Styling, outfit, pose, framing, and environment may vary, but identity must remain unchanged.",
identityNegativeRules: [
  "do not change identity",
  "do not create a different person",
  "do not alter face structure",
  "do not change eye shape",
  "do not change nose shape",
  "do not change lip shape",
  "do not change jawline",
  "do not change cheek structure",
  "avoid face drift",
  "avoid identity drift",
],
      mustBeSocialMediaReady: true,
 storyOutputMode:
        input.contentType === "story" ? "clean-story-asset-no-ui" : null,
      trendSignals: {
        hooks: trend.hooks,
        audioMoods: trend.audioMoods,
        formats: trend.formats,
        shotPatterns: trend.shotPatterns,
        ctas: trend.ctas,
        hashtags: trend.hashtags,
        summary: trend.summary,
      },
      trendUsageRules: [
        "Use trend signals subtly.",
        "Do not make the image look like a generic trend clone.",
        "Do not sacrifice face consistency, realism, or brand fit for virality.",
        "For story/post, translate trends into composition, framing, pacing feel, and creator-native realism.",
      ],
      shouldFeel: [
"naturally attractive",
"polished but realistic beauty",
"refined facial presentation",
"healthy skin appearance",
"subtle flattering features",
"premium feminine elegance",
"soft luxury beauty realism",      
  "authentic",
        "candid",
        "phone-camera believable",
        "premium but natural",
"naturally attractive",
"polished but realistic beauty",
"refined facial presentation",
"healthy skin appearance",
"soft premium complexion",
"clean refined skin texture",
"subtle glamour",
"confident feminine presence",
"high social appeal",
"premium creator energy",
"tasteful sensuality",
"soft luxury beauty realism",
"flattering camera presence",
"editorial-level attractiveness without looking fake",
"confident eye contact",
"alluring but tasteful presence",
"premium intimate lifestyle aesthetic",
"high-conversion social media appeal",
"magnetic feminine energy",
      ],
      avoid: [
        "extreme close-up portrait only",
        "passport framing",
        "studio beauty shot only",
        "same repeated composition every time",
        "overly cinematic lighting",
        "editorial fashion campaign look",
        "doll-like face",
        "over-retouched skin",
        "instagram story ui overlay",
        "profile header",
        "story progress bars",
        "send message bar",
        "reply box",
        "comment field",
        "social media screenshot frame",
        "app interface elements",
      ],
    },
    output_schema: {
      shortTitle: "string",
      scene: "string",
      framing: "string",
      activity: "string",
      mood: "string",
      stylingNotes: "string",
      negativeNotes: "string",
    },
  };

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-5.4-mini",
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: JSON.stringify(user) }],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "image_prompt_recipe",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              shortTitle: { type: "string" },
              scene: { type: "string" },
              framing: { type: "string" },
              activity: { type: "string" },
              mood: { type: "string" },
              stylingNotes: { type: "string" },
              negativeNotes: { type: "string" },
            },
            required: [
              "shortTitle",
              "scene",
              "framing",
              "activity",
              "mood",
              "stylingNotes",
              "negativeNotes",
            ],
          },
        },
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    return buildFallbackRecipe(input);
  }

  const data = await res.json();
  const rawText = data.output_text ?? data.output?.[0]?.content?.[0]?.text ?? "";

  try {
    return JSON.parse(rawText) as PromptRecipe;
  } catch {
    return buildFallbackRecipe(input);
  }
}

function buildFinalNanoBananaPrompt(
  input: ImageGenerationInput,
  recipe: PromptRecipe
): string {
  const trendHints = buildTrendAwareHints(input);

const smartControlNotes = input.smartControlsPromptBlock
  ? `Smart controls guidance: ${input.smartControlsPromptBlock}`
  : null;

  const storyUiNegativeNotes =
    input.contentType === "story"
      ? "This must be a clean story-ready visual only. Do not render any Instagram UI, story header, profile name, progress bars, message box, reply field, comment field, heart icon, share icon, caption stickers, app chrome, screenshot framing, phone frame, or social media interface overlays."
      : null;

  const formatText =
    input.contentType === "post"
      ? "authentic Instagram-ready 1:1 lifestyle post"
      : "authentic Instagram-ready 9:16 story snapshot";

  const realismNotes =
    input.contentType === "story"
      ? "looks like a real phone-captured social media story, candid, natural, slightly imperfect framing"
      : "looks like a real social media lifestyle photo, candid, natural, believable, not overly staged";

  const trendParts = hasTrendSignals(input.trendSignals)
    ? [
        trendHints.trendInfluenceInstruction,
        trendHints.primaryFormat
          ? `subtle trend format influence: ${trendHints.primaryFormat}`
          : null,
        trendHints.primaryHook
          ? `storytelling hook feeling: ${trendHints.primaryHook}`
          : null,
        trendHints.primaryShotPattern
          ? `shot/framing influence: ${trendHints.primaryShotPattern}`
          : null,
        trendHints.primaryAudioMood
          ? `visual rhythm should feel compatible with ${trendHints.primaryAudioMood}`
          : null,
        trendHints.primaryCTA
          ? `image should support a caption or CTA direction like: ${trendHints.primaryCTA}`
          : null,
        trendHints.trendSummaryText
          ? `trend context summary: ${trendHints.trendSummaryText}`
          : null,
      ]
    : [];

  const parts = [
    formatText,
    input.personaName ? `same exact person as ${input.personaName}` : null,
    recipe.scene,
    recipe.framing,
    recipe.activity,
    `mood: ${recipe.mood}`,
    recipe.stylingNotes,
    input.niche ? `content niche: ${input.niche}` : null,
    input.style ? `visual style: ${input.style}` : null,
    input.personality ? `personality tone: ${input.personality}` : null,
    input.planTitle ? `content concept: ${input.planTitle}` : null,
    input.planDay ? `calendar slot: ${input.planDay}` : null,
    input.planType ? `planned content type label: ${input.planType}` : null,
    input.advancedNotes ? `advanced creator notes: ${input.advancedNotes}` : null,
    input.brandDirection ? `brand direction: ${input.brandDirection}` : null,
    input.brandKeywords ? `brand keywords: ${input.brandKeywords}` : null,
    input.visualDoNotUse ? `do not use: ${input.visualDoNotUse}` : null,
    ...trendParts,
    input.contentType === "story"
      ? "Output a vertical 9:16 story asset, not a screenshot of a story."
      : null,
    input.contentType === "post"
      ? "Output a square 1:1 social post asset, not a screenshot of an app."
      : null,
    storyUiNegativeNotes,
    realismNotes,
smartControlNotes,
    "real-life environment",
    "natural ambient lighting",
    "subtle imperfections",
    "natural body pose",
    "believable social-media moment",
    "background should feel lived-in and realistic",
    "not overcomposed",
    "not overproduced",
    "not a studio photograph",
    "not an editorial shoot",
    "not luxury campaign style",
    "not hyper-retouched skin",
"not fake doll-like beauty",
"not unnaturally perfect symmetry",
    "not cinematic perfection",
    "preserve exact facial identity",
    "high facial consistency",
    "no identity drift",
    "no face distortion",
"not oversharpened",
"not artificial skin smoothing",
"not waxy skin",
"not plastic skin",
"not beauty-filter look",    
"she should look like a genuinely attractive premium model version of the same real person: realistic, elegant, flattering, high-appeal, socially magnetic, and polished without looking fake or overprocessed",
recipe.negativeNotes,
  ];

  return parts.filter(Boolean).join(", ");
}

export async function generateImageContent(
  input: ImageGenerationInput
): Promise<ImageGenerationResult> {
  if (!falKey) {
    throw new Error("Missing FAL_KEY.");
  }

  const recipe = await generatePromptRecipeWithOpenAI(input);
  const promptUsed = buildFinalNanoBananaPrompt(input, recipe);

  let result;

const identityAnchor = input.referenceImageUrl ?? null;

const referenceImages = identityAnchor ? [identityAnchor] : [];

  if (referenceImages.length > 0) {
    result = await fal.subscribe("fal-ai/nano-banana-2/edit", {
      input: {
        prompt: promptUsed,
        image_urls: referenceImages,
        aspect_ratio: input.contentType === "post" ? "1:1" : "9:16",
        output_format: "jpeg",
      },
      logs: true,
    });
  } else {
    result = await fal.subscribe("fal-ai/nano-banana-2", {
      input: {
        prompt: promptUsed,
        image_size: getImageSize(input.contentType),
        num_images: 1,
        output_format: "jpeg",
      },
      logs: true,
    });
  }

  const firstImage = result.data?.images?.[0]?.url;

  if (!firstImage) {
    throw new Error("fal.ai did not return an image URL.");
  }

  return {
    imageUrl: firstImage,
    thumbnailUrl: firstImage,
    promptUsed,
    usedReferenceFace: referenceImages.length > 0,
  };
}
