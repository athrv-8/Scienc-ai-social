import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ImageResolution, AspectRatio } from "../types";

// Helper to get the API client with the selected key
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generates text content for all 3 platforms simultaneously using Gemini 2.5 Flash (speed)
 * or Pro (quality). Using Pro as requested for complex tasks.
 */
export const generateSocialText = async (topic: string, tone: string) => {
  const ai = getClient();
  
  const prompt = `
    You are an expert social media manager. 
    Topic: "${topic}"
    Tone: "${tone}"

    Generate 3 distinct social media posts:
    1. LinkedIn: Professional, long-form, uses paragraphs and bullet points if needed.
    2. Twitter/X: Short, punchy, under 280 chars, uses 1-2 hashtags.
    3. Instagram: Visual-focused caption, engaging hook, uses line breaks and 10-15 relevant hashtags.

    Also provide a detailed, creative image generation prompt for EACH platform that matches the post's vibe and the platform's aesthetic.
  `;

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      linkedin: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING, description: "The post text content" },
          imagePrompt: { type: Type.STRING, description: "Prompt to generate an image for this post" }
        },
        required: ["content", "imagePrompt"]
      },
      twitter: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ["content", "imagePrompt"]
      },
      instagram: {
        type: Type.OBJECT,
        properties: {
          content: { type: Type.STRING },
          imagePrompt: { type: Type.STRING }
        },
        required: ["content", "imagePrompt"]
      }
    },
    required: ["linkedin", "twitter", "instagram"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', // Using Pro for high quality reasoning/writing
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a world-class social media copywriter."
    }
  });

  const text = response.text;
  if (!text) throw new Error("No text returned from model");
  
  return JSON.parse(text);
};

/**
 * Generates an image for a specific platform using Gemini 3 Pro Image Preview
 */
export const generatePlatformImage = async (
  prompt: string, 
  aspectRatio: AspectRatio, 
  resolution: ImageResolution
): Promise<string> => {
  const ai = getClient();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: resolution
        }
      }
    });

    // Extract image from response parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};