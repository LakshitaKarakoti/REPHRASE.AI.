import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper for model invocation with graceful fallback
async function callGeminiModel(params: {
  contents: string;
  systemInstruction: string;
  responseSchema?: any;
}) {
  const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
  let lastErr: any = null;

  for (const model of modelsToTry) {
    try {
      console.log(`[callGeminiModel] Attempting with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: {
          systemInstruction: params.systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: params.responseSchema,
        },
      });
      console.log(`[callGeminiModel] Success with model: ${model}`);
      return response;
    } catch (err: any) {
      console.warn(`[callGeminiModel] Model ${model} attempt failed:`, err?.message || err);
      lastErr = err;
    }
  }

  throw lastErr || new Error('All Gemini models failed to generate content');
}

// Single tone rephrase endpoint
app.post('/api/rephrase', async (req, res) => {
  console.log('[API] POST /api/rephrase body:', req.body);
  try {
    const {
      rawText,
      tone = 'Formal',
      recipient = 'Colleague',
      format = 'email',
      length = 'balanced',
      customInstruction = '',
    } = req.body;

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({ error: 'Please provide rough notes or raw text to rephrase.' });
    }

    const systemInstruction = `You are Rephrase.ai, an elite communication strategist and executive ghostwriter.
Transform rough thoughts, fragmented notes, or conversational drafts into polished, high-impact messages.

Target Tone: ${tone}
Core Tone Rules:
- Formal: Diplomatic, structured, courteous, highly professional etiquette.
- Friendly: Warm, collaborative, empathetic, conversational, relationship-building.
- Firm: Direct, assertive, unapologetic, sets clear boundaries & accountability, eliminates passive-aggression or weak qualifiers.
- Concise: Extremely punchy, TL;DR style, action-oriented, zero fluff.
- Persuasive: Compelling, benefit-focused, persuasive logic with engaging call to action.
- Empathetic: Considerate, compassionate, understanding, gentle framing.

Target Recipient: ${recipient || 'General audience'}
Desired Format: ${format} (if email, provide subject; if chat, provide punchy Slack/Teams message)
Desired Length: ${length}
${customInstruction ? `User instructions: ${customInstruction}` : ''}

Preserve all essential facts and context from the notes. Output in valid JSON matching the schema.`;

    const prompt = `Draft the message for the following rough notes:
"""
${rawText.trim()}
"""`;

    const response = await callGeminiModel({
      contents: prompt,
      systemInstruction,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: {
            type: Type.STRING,
            description: 'A crisp subject line if format is email, otherwise a brief summary title or empty string.',
          },
          body: {
            type: Type.STRING,
            description: 'The complete rephrased message draft ready to send.',
          },
          toneDescription: {
            type: Type.STRING,
            description: 'A concise 1-2 sentence breakdown explaining why this draft achieves the intended tone for this recipient.',
          },
          highlights: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 bullet points detailing key improvements made over the raw notes.',
          },
          alternativeOpeners: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 alternative opening lines the user can swap in if desired.',
          },
        },
        required: ['body', 'toneDescription', 'highlights'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/rephrase:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to generate rephrased message. Please try again.',
    });
  }
});

// Compare all 3 core tones simultaneously: Formal, Friendly, and Firm
app.post('/api/compare-tones', async (req, res) => {
  try {
    const { rawText, recipient = 'Colleague', format = 'email' } = req.body;

    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({ error: 'Please provide rough notes or raw text to rephrase.' });
    }

    const systemInstruction = `You are Rephrase.ai.
Draft THREE distinct versions of the user's raw notes for the recipient "${recipient}", formatted as "${format}":
1. FORMAL: Professional, diplomatic, elegant, respectful, structured.
2. FRIENDLY: Warm, approachable, collaborative, upbeat, positive.
3. FIRM: Direct, assertive, unapologetic, setting clear expectations and boundaries while remaining professional.

Ensure each version faithfully captures all key details from the raw notes. Return valid JSON.`;

    const prompt = `Raw notes:
"""
${rawText.trim()}
"""`;

    const response = await callGeminiModel({
      contents: prompt,
      systemInstruction,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          formal: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              nuance: { type: Type.STRING, description: 'Brief note on why this fits formal etiquette.' },
            },
            required: ['body', 'nuance'],
          },
          friendly: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              nuance: { type: Type.STRING, description: 'Brief note on why this sounds warm and collegial.' },
            },
            required: ['body', 'nuance'],
          },
          firm: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING },
              nuance: { type: Type.STRING, description: 'Brief note on how this sets clear boundaries without being rude.' },
            },
            required: ['body', 'nuance'],
          },
        },
        required: ['formal', 'friendly', 'firm'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/compare-tones:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to compare tones. Please try again.',
    });
  }
});

// Quick refinement endpoint
app.post('/api/refine', async (req, res) => {
  try {
    const { currentDraft, instruction, recipient, tone } = req.body;

    if (!currentDraft || !instruction) {
      return res.status(400).json({ error: 'Missing draft or refinement instruction.' });
    }

    const systemInstruction = `You are Rephrase.ai. Refine the existing drafted message based on the user's specific request.
Recipient: ${recipient || 'Specified recipient'}
Original Tone: ${tone || 'Selected tone'}
Refinement Request: ${instruction}

Keep the message polished and ready to copy/paste. Output valid JSON.`;

    const response = await callGeminiModel({
      contents: `Existing draft:
"""
${currentDraft}
"""

Tweak request: "${instruction}".`,
      systemInstruction,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          body: { type: Type.STRING },
          changeSummary: { type: Type.STRING },
        },
        required: ['body', 'changeSummary'],
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error in /api/refine:', err);
    return res.status(500).json({
      error: err?.message || 'Failed to refine draft. Please try again.',
    });
  }
});

// Vite dev middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Rephrase.ai server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
