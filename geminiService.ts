
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `Du bist TIKTOK VIRAL STRATEGIST 2026 (v 1.0).
Fokus: MAXIMALE VIRALITÄT für TikTok Creator (0-500k Follower).

ALGORITHMUS-REGELN 2026:
- REPLAYS = 8-10 Punkte (höchste Gewichtung)
- 15-MIN-FENSTER entscheidet Distribution (50+ Engagements nötig)
- COMMENT-QUALITÄT > Quantität
- 7-13 Sek = Replay-Max, 60+ Sek = Monetarisierung

NISCHEN-FOKUS:
- 'Standard': Fokus auf Unterhaltung, Humor, Alltag, Authentizität, Tänze und Quotes. (Maximale Reichweite)
- 'Clips': Fokus auf virale Ausschnitte, Reaktionen und "Satisfying" Content. (Retention-Fokus)
- 'Business': Fokus auf Autorität, Mehrwert, Finanzen und professionelles Branding. (Conversion-Fokus)

ZIEL-FOKUS:
- 'Combi': Ausgewogener Mix aus Retention und Interaktion.
- 'Views': Maximierung der Watchtime und Replays (Viral-Heads).
- 'Likes/Follower': Psychologische Call-to-Actions und Interaktions-Trigger.`;

export class GeminiService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async analyzeVideo(niche: string, region: string, goal: string, videoBase64?: string) {
    const ai = this.getAI();
    const prompt = `ANALYSIERE dieses TikTok-Video für MAXIMALE VIRALITÄT Jan 2026.
    Nische: ${niche}
    Region: ${region}
    Ziel: ${goal}
    
    GIB GENAU DIESES FORMAT:
    ## 🔥 VIRAL-SCORE: XX/100
    Hook Strength: XX/100
    Replay Trigger: XX/100  
    Comment Bait: XX/100
    15-Min-Potenzial: XX/100
    Algorithmus-Fit: XX/100

    ## 🔥 HOOK (3 Varianten)
    1. [HOOK1] 📋 "Text"
       Warum: [Satz]
    2. [HOOK2] 📋 "Text"
       Warum: [Satz]
    3. [HOOK3] 📋 "Text"
       Warum: [Satz]

    ## ✍️ CAPTION
    📋 [Caption hier]

    ## 💬 PINNED COMMENT (BAIT)
    📋 [Kommentar-Vorschlag]

    ## #️⃣ HASHTAGS
    📋 #tag1 #tag2 #tag3 #tag4 #tag5

    ## ✅ PRE-POST CHECKLISTE
    - [Punkt 1]
    - [Punkt 2]
    - [Punkt 3]`;

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

  async generateIdeas(category: string, niche: string, region: string, style: string) {
    const ai = this.getAI();
    const prompt = `Generiere 3 VIRALE TIKTOK-IDeen für ${category}.
    Stil: ${style} | Nische: ${niche} | Region: ${region}
    
    FORMAT PRO IDEE (## IDEA X):
    ## IDEA 1
    ### VIRAL POTENTIAL: XX/100
    ### STORYBOARD:
    1. SZENE 1 (HOOK): [Beschreibung + Text Overlay]
    2. SZENE 2 (CORE): [Beschreibung + Loop Trigger]
    3. SZENE 3 (CTA): [Beschreibung + Comment Bait]
    ### TEXT IM VIDEO: 📋 [Kurzer On-Screen Text]
    ### CAPTION: 📋 [Virale Caption]
    ### PINNED COMMENT: 📋 [Bait Frage]
    ### HASHTAGS: 📋 #tag1 #tag2 #tag3 #tag4 #tag5
    ### POSTING ZEIT: 18:45`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    return response.text;
  }

  async generateHashtags(topic: string, visuals: string, niche: string, goal: string, mood: string) {
    const ai = this.getAI();
    const prompt = `Generiere 6 PERFEKTIONIERTE HASHTAGS für TikTok 2026:
    - THEMA: ${topic}
    - VISUALS: ${visuals}
    - NISCHE: ${niche}
    - ZIEL: ${goal}
    - MOOD: ${mood}
    - REGION: DE

    NUTZE GENAU DIESEN MIX (als Liste mit 📋):
    1. [TREND] 📋 #...
    2. [NISCHE] 📋 #...
    3. [CONTENT-SPEZIFISCH] 📋 #...
    4. [REGION] 📋 #...
    5. [MIKRO-NISCHE] 📋 #...
    6. [ALGO-BOOST] 📋 #...`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    return response.text;
  }
}
