import RunwayML, { TaskFailedError } from "@runwayml/sdk";

export type RunwayReelInput = {
  promptText: string;
  promptImage?: string | null;
  model?: "gen4_turbo" | "gen4.5";
  ratio?: "720:1280" | "1280:720";
  duration?: 5 | 10;
};

export type RunwayReelResult = {
  taskId: string;
  status: string;
  videoUrl: string;
  thumbnailUrl: string | null;
};

const client = new RunwayML({
  apiKey: process.env.RUNWAYML_API_SECRET,
});

export async function generateReelWithRunway(
  input: RunwayReelInput
): Promise<RunwayReelResult> {
  if (!process.env.RUNWAYML_API_SECRET) {
    throw new Error("Missing RUNWAYML_API_SECRET");
  }

  try {
const model = input.model ?? "gen4_turbo";
const promptText = input.promptText;
const promptImage = input.promptImage ?? null;
const ratio = input.ratio ?? "720:1280";
const duration = input.duration ?? 5;

if (!promptImage) {
  throw new Error("Runway reel generation requires a promptImage for face consistency.");
}

let task;

if (model === "gen4.5") {
  task = await client.imageToVideo
    .create({
      model: "gen4.5",
      promptText,
      promptImage,
      ratio,
      duration,
    })
    .waitForTaskOutput();
} else {
  task = await client.imageToVideo
    .create({
      model: "gen4_turbo",
      promptText,
      promptImage,
      ratio,
      duration,
    })
    .waitForTaskOutput();
}

    const output = task.output as unknown;

    let videoUrl: string | null = null;
    let thumbnailUrl: string | null = null;

    if (Array.isArray(output) && typeof output[0] === "string") {
      videoUrl = output[0];
    } else if (output && typeof output === "object") {
      const obj = output as Record<string, unknown>;
      if (typeof obj.video === "string") videoUrl = obj.video;
      if (typeof obj.url === "string") videoUrl = obj.url;
      if (typeof obj.thumbnail === "string") thumbnailUrl = obj.thumbnail;
      if (typeof obj.previewImage === "string") thumbnailUrl = obj.previewImage;
    }

    if (!videoUrl) {
      throw new Error("Runway task completed but no video URL was returned.");
    }

    return {
      taskId: task.id,
      status: task.status,
      videoUrl,
      thumbnailUrl,
    };
  } catch (error) {
    if (error instanceof TaskFailedError) {
      throw new Error(`Runway task failed: ${JSON.stringify(error.taskDetails)}`);
    }
    throw error;
  }
}
