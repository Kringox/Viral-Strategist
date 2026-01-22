
import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `Du bist TIKTOK VIRAL STRATEGIST 2026 (v 1.0). 
Fokus: Maximale Virality für Creator (0-500k Follower).
WICHTIG: Antworte kurz, präzise und strikt im Schema. Keine Prosa.`;

export class GeminiService {
  private getAI() {
    // Erstellt jedes Mal eine neue Instanz, um sicherzustellen, dass der aktuellste API_KEY verwendet wird.
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private async callWithRetry(fn: () => Promise<any>, retries = 2, delay = 2000): Promise<any> {
    try {
      return await fn();
    } catch (error: any) {
      if (retries > 0 && (error.message?.includes('429') || error.status === 429)) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.callWithRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async analyzeVideo(niche: string, region: string, goal: string, mood: string, videoBase64?: string) {
    const ai = this.getAI();
    const prompt = `VIRAL-SCAN: Nische=${niche}, Ziel=${goal}, Stimmung=${mood}, Region=${region}.
    ANTWORTE STRIKT:
    VIRAL-CODE: [CODE]
    SCORE: [XX]%
    INHALT: [ANALYSE]
    VIDEO-TEXT: 📋 [TEXT]
    CAPTION: 📋 [TEXT]
    HASHTAGS: 📋 [#tag1 #tag2]
    POST-ZEIT: [HH:MM]`;

    const contents: any = videoBase64 ? {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "video/mp4", data: videoBase64 } }
      ]
    } : { parts: [{ text: prompt }] };

    const result = await this.callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    }));

    return result.text;
  }

  async generateIdeas(category: string, niche: string, region: string, goal: string, mood: string) {
    const ai = this.getAI();
    const prompt = `3 Virale Ideen für: ${category}. Nische=${niche}, Ziel=${goal}.
    SCHEMA PRO IDEE:
    ## IDEA [X]
    VIRAL-CODE: [CODE]
    SCORE: [XX]%
    VIDEO-TEXT: 📋 [OVERLAY]
    CAPTIONS: 📋 [TEXT]
    HASHTAGS: 📋 [#tag1 #tag2]
    POST-ZEIT: [HH:MM]`;

    const result = await this.callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    }));

    return result.text;
  }

  async generateHashtags(topic: string, visuals: string, niche: string, goal: string, mood: string, region: string) {
    const ai = this.getAI();
    const prompt = `6 TikTok Tags für: ${topic}. Visuals: ${visuals}, Nische: ${niche}.
    FORMAT: [TYPE] 📋 #tag`;

    const result = await this.callWithRetry(() => ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    }));

    return result.text;
  }
}
