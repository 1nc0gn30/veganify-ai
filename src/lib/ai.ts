import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

export type AIProvider = 'gemini' | 'openai';
export type PromptVibe = 'balanced' | 'comfort' | 'high-protein' | 'quick' | 'chef';

interface VeganifyOptions {
  provider: AIProvider;
  apiKey: string;
  model?: string;
  vibe?: PromptVibe;
  secretSauce?: string;
}

const BASE_PROMPT = `
  Identify the food in this image. 
  Then, provide a high-quality, professional-grade vegan version of this exact dish.
  
  Structure your response in Markdown:
  1. **Identified Dish**: Name of the dish in the image.
  2. **Vegan Alternative Name**: A creative name for the vegan version.
  3. **Why this works**: A brief explanation of how the vegan version mimics the original's texture and flavor.
  4. **Ingredients**: A clear list of ingredients.
  5. **Instructions**: Step-by-step cooking instructions.
  6. **Pro Tips**: 2-3 professional tips to make it taste amazing.
  
  Ensure the recipe is truly "top quality" and not generic. Use specific plant-based techniques (like using vital wheat gluten for meatiness, or cashews for creaminess where appropriate).
`;

const VIBE_PROMPTS: Record<PromptVibe, string> = {
  balanced: "Keep the tone practical and friendly. Balance flavor, nutrition, and effort.",
  comfort: "Favor cozy comfort-food flavors with rich textures and satisfying sauces.",
  "high-protein": "Prioritize higher-protein ingredients and clearly call out protein-forward swaps.",
  quick: "Optimize for speed: fewer ingredients, shorter cook times, and simple prep.",
  chef: "Use elevated chef-style techniques, plating, and nuanced flavor-building details."
};

function buildPrompt(vibe: PromptVibe = "balanced", secretSauce = "") {
  const vibePrompt = VIBE_PROMPTS[vibe] ?? VIBE_PROMPTS.balanced;
  const trimmedSecretSauce = secretSauce.trim();
  const secretSaucePrompt = trimmedSecretSauce
    ? `\nExtra app guidance ("secret sauce") to apply:\n${trimmedSecretSauce}\n`
    : "";

  return `${BASE_PROMPT}\n\nVibe to apply:\n${vibePrompt}${secretSaucePrompt}`;
}

export async function veganifyFood(base64Image: string, mimeType: string, options: VeganifyOptions) {
  const { provider, apiKey, model, vibe, secretSauce } = options;
  const prompt = buildPrompt(vibe, secretSauce);

  if (provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey });
    const geminiModel = model || "gemini-2.5-flash";
    
    const imagePart = {
      inlineData: {
        data: base64Image.split(",")[1],
        mimeType,
      },
    };

    try {
      const response = await ai.models.generateContent({
        model: geminiModel,
        contents: [{ parts: [{ text: prompt }, imagePart] }],
      });
      return response.text;
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found") || error?.message?.includes("API key not valid")) {
        throw new Error("API_KEY_INVALID");
      }
      throw error;
    }
  } else if (provider === 'openai') {
    const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
    const openaiModel = model || "gpt-4o-mini";

    try {
      const response = await openai.chat.completions.create({
        model: openaiModel,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: {
                  url: base64Image,
                },
              },
            ],
          },
        ],
      });
      return response.choices[0].message.content;
    } catch (error: any) {
      if (error?.status === 401) {
        throw new Error("API_KEY_INVALID");
      }
      throw error;
    }
  }
  
  throw new Error("Unsupported provider");
}
