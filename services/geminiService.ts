import { GoogleGenAI, Type, Schema } from "@google/genai";
import { DailyPlan, UserPreferences, ActivityCategory } from "../types";

const apiKey = process.env.API_KEY || "";

// Schema definition for the structured JSON response
const planSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    quote: {
      type: Type.STRING,
      description: "A motivating quote relevant to the user's goal and mood.",
    },
    focusSummary: {
      type: Type.STRING,
      description: "A 2-sentence summary of how this day focuses on their goal.",
    },
    schedule: {
      type: Type.ARRAY,
      description: "A chronological list of schedule items.",
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING, description: "Time range (e.g., '07:00 - 08:00')" },
          activity: { type: Type.STRING, description: "Short title of the activity" },
          category: {
            type: Type.STRING,
            enum: [
              ActivityCategory.WORK,
              ActivityCategory.HEALTH,
              ActivityCategory.REST,
              ActivityCategory.LEARNING,
              ActivityCategory.SOCIAL,
              ActivityCategory.OTHER,
            ],
            description: "Category of the activity",
          },
          description: { type: Type.STRING, description: "Brief details about what to do" },
          tip: { type: Type.STRING, description: "A micro-habit or mindset tip for this specific block" },
        },
        required: ["time", "activity", "category", "description", "tip"],
      },
    },
  },
  required: ["quote", "focusSummary", "schedule"],
};

export const generateDailyPlan = async (prefs: UserPreferences): Promise<DailyPlan> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const userContext = prefs.userName ? `for ${prefs.userName}` : "for the user";

  const prompt = `
    Create a daily schedule ${userContext} based on the following parameters:
    - Wake up time: ${prefs.wakeTime}
    - Bedtime: ${prefs.bedTime}
    - Main Goal for the day: "${prefs.mainGoal}"
    - Current Goal Progress: ${prefs.goalProgress}% (Adjust the schedule intensity based on this. If 0%, focus on starting. If 90%, focus on finishing touches.)
    - Current Mood/State: "${prefs.mood}"
    - Intensity Level: "${prefs.level}"

    Context for Levels:
    - Basic Structure: Focus on essentials, low pressure, plenty of breaks. Good for low energy or weekends.
    - Balanced Flow: Standard productivity mixed with wellness.
    - High Performance: Tightly optimized, deep work blocks, bio-hacking tips, high output.

    Ensure the schedule fills the time between wake up and bed time.
    Format the output strictly as JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: planSchema,
        systemInstruction: "You are an expert productivity coach and chronobiologist. You create schedules that optimize human energy levels.",
        temperature: 0.7,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as DailyPlan;
    } else {
      throw new Error("No plan generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};