import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export type GenerateVideoInput = {
  prompt: string;
  startImageUrl: string;
  duration?: 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
  generateAudio?: boolean;
  aspectRatio?: "16:9" | "9:16" | "1:1";
};

export type GenerateVideoResult = {
  videoUrl: string;
  thumbnailUrl: string;
};

export async function generateVideoContent(
  input: GenerateVideoInput
): Promise<GenerateVideoResult> {
  try {
    console.log("KLING V3 INPUT", input);

    const result = await fal.subscribe(
      "fal-ai/kling-video/v3/pro/image-to-video",
      {
        input: {
          prompt: input.prompt,
          start_image_url: input.startImageUrl,
          duration: input.duration ?? 5,
          generate_audio: input.generateAudio ?? false,
          aspect_ratio: input.aspectRatio ?? "9:16",
          negative_prompt: "blur, distort, and low quality",
          cfg_scale: 0.5,
        },
        logs: true,
      }
    );

    console.log("KLING V3 RAW RESULT", JSON.stringify(result, null, 2));

    const data = result.data as {
      video?: {
        url?: string;
      };
    };

    const videoUrl = data?.video?.url;

    if (!videoUrl) {
      throw new Error("Kling V3 video URL missing from response.");
    }

    return {
      videoUrl,
      thumbnailUrl: input.startImageUrl,
    };
  } catch (error) {
    console.error("KLING V3 ERROR", error);
    throw error;
  }
}
