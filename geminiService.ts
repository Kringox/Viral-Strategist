
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `Du bist TIKTOK VIRAL STRATEGIST 2026 (v 1.0).
Deine Aufgabe ist es, Creator dabei zu unterstützen, maximale Reichweite zu erzielen.
Erstelle originelle, kreative und algorithmus-optimierte Inhalte basierend auf den Eingaben.

WICHTIG: Halte dich exakt an das vorgegebene Antwort-Schema. Verwende keine zusätzliche Markdown-Formatierung wie fettgedruckte Labels, außer es ist im Schema so vorgesehen.`;

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeVideo(niche: string, region: string, goal: string, mood: string, videoBase64?: string) {
    const ai = this.getAI();
    const prompt = `Führe einen VIRAL-SCAN durch. 
    Kontext: Nische=${niche}, Ziel=${goal}, Stimmung=${mood}, Region=${region}.
    
    ANTWORTE STRIKT IN DIESEM FORMAT:
    VIRAL-CODE: [CODE]
    SCORE: [XX]%
    INHALT: [KI-ANALYSE]
    VIDEO-TEXT: 📋 [TEXT]
    CAPTION: 📋 [TEXT]
    HASHTAGS: 📋 [#tag1 #tag2]
    POST-ZEIT: [HH:MM]`;

    const contents: any = videoBase64 ? {
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "video/mp4", data: videoBase64 } }
      ]
    } : prompt;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    return response.text;
  }

  async generateIdeas(category: string, niche: string, region: string, goal: string, mood: string) {
    const ai = this.getAI();
    const prompt = `Erstelle 3 hoch-virale Ideen für: ${category}.
    Parameter: Nische=${niche}, Ziel=${goal}, Stimmung=${mood}, Region=${region}.
    
    FORMAT PRO IDEE:
    ## IDEA 1
    VIRAL-CODE: [CODE]
    SCORE: [XX]%
    VIDEO-TEXT: 📋 [OVERLAY TEXT]
    CAPTIONS: 📋 [CAPTIONS TEXT]
    HASHTAGS: 📋 [#tag1 #tag2]
    POST-ZEIT: [HH:MM]
    
    ## IDEA 2
    ... (selbes Schema)
    ## IDEA 3
    ... (selbes Schema)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    return response.text;
  }

  async generateHashtags(topic: string, visuals: string, niche: string, goal: string, mood: string, region: string) {
    const ai = this.getAI();
    const prompt = `Generiere 6 TikTok Hashtags für Thema: ${topic}.
    Visuals: ${visuals}, Nische: ${niche}, Stimmung: ${mood}.

    FORMAT:
    1. [TYPE] 📋 #tag`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    return response.text;
  }
}
