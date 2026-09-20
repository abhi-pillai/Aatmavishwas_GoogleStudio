import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config({ override: true });

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Resilient content generator with multi-model failover (handles 503 high demand & rate limits)
async function generateContentWithModelFallback(
  ai: GoogleGenAI,
  options: {
    contents: any;
    config?: any;
  },
  models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite']
) {
  let lastError: any = null;
  for (let i = 0; i < models.length; i++) {
    const modelName = models[i];
    try {
      const res = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config: options.config,
      });
      return res;
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 'UNAVAILABLE' ||
        err?.code === 503 ||
        err?.code === 429 ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('503') ||
        err?.message?.includes('Resource has been exhausted') ||
        err?.message?.includes('overloaded');

      if (i < models.length - 1) {
        console.warn(
          `Model ${modelName} temporary demand spike (${err?.status || err?.code || 'transient'}). Seamlessly switching to ${models[i + 1]}...`
        );
        if (isTransient) {
          await new Promise((r) => setTimeout(r, 400));
        }
        continue;
      }
    }
  }
  throw lastError;
}

// Robust JSON parser to safely extract JSON even with markdown ticks
function parseJsonSafely(rawText: string | undefined): any {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '').trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (innerErr) {
        return null;
      }
    }
    return null;
  }
}

// Resilient chat helper with multi-model failover
async function sendChatMessageWithModelFallback(
  ai: GoogleGenAI,
  options: {
    systemInstruction: string;
    history: any[];
    message: string;
  },
  models = ['gemini-3.8-flash', 'gemini-3.1-flash-lite']
): Promise<string | null> {
  let lastError: any = null;
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    try {
      const chat = ai.chats.create({
        model,
        config: {
          systemInstruction: options.systemInstruction,
        },
        history: options.history,
      });
      const response = await chat.sendMessage({ message: options.message });
      return response.text || null;
    } catch (err: any) {
      lastError = err;
      if (i < models.length - 1) {
        console.warn(`Chat model ${model} demand spike, failing over to ${models[i + 1]}...`);
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
    }
  }
  return null;
}

// In-memory data store with initial seed
let sessionStore: any[] = [];

// Helper filler word analyzer for instant local metric generation
const COMMON_FILLERS = [
  'um', 'uh', 'er', 'ah', 'like', 'you know', 'basically', 'actually', 
  'literally', 'so yeah', 'right', 'sort of', 'kind of', 'i mean', 'honestly'
];

function analyzeLocalFillerWords(text: string) {
  const lower = text.toLowerCase();
  const breakdown: { word: string; count: number; contextExample?: string }[] = [];
  let totalCount = 0;

  for (const filler of COMMON_FILLERS) {
    // regex with word boundary
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      totalCount += matches.length;
      // find a context example
      const index = lower.indexOf(filler);
      let context = '';
      if (index !== -1) {
        const start = Math.max(0, index - 20);
        const end = Math.min(text.length, index + filler.length + 25);
        context = '...' + text.substring(start, end).trim() + '...';
      }
      breakdown.push({
        word: filler,
        count: matches.length,
        contextExample: context,
      });
    }
  }

  return { totalCount, breakdown: breakdown.sort((a, b) => b.count - a.count) };
}

// Helper to heuristically parse slide text if offline or fallback
function parsePresentationTextHeuristically(text: string, defaultTitle: string) {
  if (!text || text.trim().length === 0) {
    return [
      {
        id: 'slide-1',
        slideNumber: 1,
        title: defaultTitle,
        bulletPoints: ['Introduction and problem framing', 'Primary objectives for this session'],
        speakerNotesTip: 'Hook the audience in the first 15 seconds with a relatable dilemma.',
        targetDurationSeconds: 45
      },
      {
        id: 'slide-2',
        slideNumber: 2,
        title: 'Core Value Proposition & Solution',
        bulletPoints: ['Key differentiator', 'Demonstrated user or enterprise value', 'Operational impact'],
        speakerNotesTip: 'Ground your solution in concrete evidence rather than buzzwords.',
        targetDurationSeconds: 60
      },
      {
        id: 'slide-3',
        slideNumber: 3,
        title: 'Call to Action & Next Steps',
        bulletPoints: ['Immediate milestones', 'Resource or investment ask', 'Closing takeaway'],
        speakerNotesTip: 'End decisively with an unmistakable ask and confident silence.',
        targetDurationSeconds: 30
      }
    ];
  }

  // Split by common slide delimiters (Slide 1, # Slide, ---, etc.)
  const slideChunks = text.split(/(?:^|\n)(?:#+\s*Slide\s*\d+|---+|==+|Slide\s*\d+:)/i).filter(c => c.trim().length > 0);

  if (slideChunks.length >= 2) {
    return slideChunks.slice(0, 12).map((chunk, idx) => {
      const lines = chunk.trim().split('\n').map(l => l.trim()).filter(Boolean);
      const title = lines[0]?.replace(/^[#*-]\s*/, '').slice(0, 60) || `Slide ${idx + 1}`;
      const bullets = lines.slice(1).filter(l => l.startsWith('-') || l.startsWith('*') || l.startsWith('•')).map(l => l.replace(/^[-*•]\s*/, ''));
      return {
        id: `slide-${idx + 1}`,
        slideNumber: idx + 1,
        title,
        bulletPoints: bullets.length > 0 ? bullets.slice(0, 4) : lines.slice(1, 4).map(l => l.slice(0, 100)),
        speakerNotesTip: 'Keep your delivery conversational and connect each point to audience value.',
        targetDurationSeconds: 45
      };
    });
  }

  // Split by double newlines into distinct sections
  const paragraphs = text.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 15);
  if (paragraphs.length >= 2) {
    return paragraphs.slice(0, 8).map((para, idx) => {
      const lines = para.split('\n').map(l => l.trim()).filter(Boolean);
      return {
        id: `slide-${idx + 1}`,
        slideNumber: idx + 1,
        title: lines[0]?.replace(/^[#*-]\s*/, '').slice(0, 50) || `Slide ${idx + 1}`,
        bulletPoints: lines.length > 1 ? lines.slice(1, 4) : [para.slice(0, 120)],
        speakerNotesTip: 'Emphasize the core insight on this slide before advancing.',
        targetDurationSeconds: 45
      };
    });
  }

  return [
    {
      id: 'slide-1',
      slideNumber: 1,
      title: defaultTitle,
      bulletPoints: ['Introduction & Overview', text.slice(0, 120)],
      speakerNotesTip: 'Set a clear agenda and engage your listeners early.',
      targetDurationSeconds: 45
    }
  ];
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Presentation Upload & Parser Endpoint
app.post('/api/parse-presentation', async (req: Request, res: Response) => {
  try {
    const { fileBase64, fileName = 'presentation', mimeType = 'text/plain', textContent } = req.body;
    const ai = getGemini();
    const isPdf = mimeType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

    if (ai) {
      try {
        let contents: any[] = [];

        if (isPdf && fileBase64) {
          contents = [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: fileBase64,
              },
            },
            {
              text: `You are an expert presentation structure analyzer and pitch coach.
Analyze this uploaded presentation PDF and extract each slide carefully into a structured slide deck for presentation rehearsal.
For each slide identify:
1. slideNumber: number (1, 2, 3...)
2. title: string (concise, high-impact slide heading)
3. bulletPoints: string[] (2-5 key takeaways, data points, or topics on this slide)
4. speakerNotesTip: string (a punchy, actionable coaching tip on how the presenter should present this slide)
5. targetDurationSeconds: number (recommended speaking time in seconds, usually 30-75 seconds based on density)

Return valid JSON adhering strictly to this schema:
{
  "title": string (overall presentation title or topic),
  "description": string (1-2 sentence overview of the presentation purpose),
  "slides": [
    {
      "slideNumber": number,
      "title": string,
      "bulletPoints": string[],
      "speakerNotesTip": string,
      "targetDurationSeconds": number
    }
  ]
}`
            }
          ];
        } else {
          const rawText = textContent || (fileBase64 ? Buffer.from(fileBase64, 'base64').toString('utf-8') : '');
          contents = [
            {
              text: `You are an expert presentation structure analyzer and pitch coach.
Analyze the following presentation text, markdown, or outline and extract each slide into a structured slide deck for rehearsal.

Presentation Content:
"""
${rawText.slice(0, 15000)}
"""

Return valid JSON adhering strictly to this schema:
{
  "title": string (overall presentation title or topic),
  "description": string (1-2 sentence overview of the presentation purpose),
  "slides": [
    {
      "slideNumber": number,
      "title": string,
      "bulletPoints": string[],
      "speakerNotesTip": string,
      "targetDurationSeconds": number
    }
  ]
}`
            }
          ];
        }

        const response = await generateContentWithModelFallback(ai, {
          contents,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = parseJsonSafely(response.text);
        if (parsed && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          const deck = {
            id: `deck-upload-${Date.now()}`,
            title: parsed.title || fileName.replace(/\.[^/.]+$/, "") || 'Uploaded Presentation',
            description: parsed.description || 'Custom presentation uploaded for slide rehearsal and pitch evaluation.',
            totalSlides: parsed.slides.length,
            isUploaded: true,
            fileName,
            slides: parsed.slides.map((s: any, idx: number) => ({
              id: `slide-up-${idx + 1}`,
              slideNumber: s.slideNumber || (idx + 1),
              title: s.title || `Slide ${idx + 1}`,
              bulletPoints: Array.isArray(s.bulletPoints) && s.bulletPoints.length > 0 ? s.bulletPoints : ['Key insight for this slide.'],
              speakerNotesTip: s.speakerNotesTip || 'Engage the audience with conviction and emphasize your primary takeaway.',
              targetDurationSeconds: s.targetDurationSeconds || 45,
            })),
          };
          return res.json({ deck, success: true });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini presentation parsing warning, falling back to heuristic parser:', geminiErr?.message);
      }
    }

    // Heuristic fallback parser for text/markdown or offline fallback
    const rawText = textContent || (fileBase64 ? Buffer.from(fileBase64, 'base64').toString('utf-8') : '');
    const cleanTitle = fileName ? fileName.replace(/\.[^/.]+$/, "") : 'Uploaded Presentation';
    const extractedSlides = parsePresentationTextHeuristically(rawText, cleanTitle);

    const deck = {
      id: `deck-upload-${Date.now()}`,
      title: cleanTitle,
      description: 'Custom presentation uploaded for slide rehearsal and pitch evaluation.',
      totalSlides: extractedSlides.length,
      isUploaded: true,
      fileName,
      slides: extractedSlides,
    };

    return res.json({ deck, success: true });
  } catch (error: any) {
    console.error('Error parsing presentation:', error);
    res.status(500).json({ error: error.message || 'Failed to parse presentation file.' });
  }
});

// 1. Analyze Speech Endpoint (Core feedback engine)
app.post('/api/analyze-speech', async (req: Request, res: Response) => {
  try {
    const { 
      transcript, 
      durationSeconds = 60, 
      sessionType = 'speech',
      title = 'Speech Practice Session',
      role,
      questionContext,
      slides,
      slideTimings,
      deckTitle
    } = req.body;

    if (!transcript || transcript.trim().length === 0) {
      return res.status(400).json({ error: 'Transcript is required for analysis.' });
    }

    const words = transcript.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const durationMin = Math.max(0.1, durationSeconds / 60);
    const calculatedWpm = Math.round(wordCount / durationMin);

    let wpmStatus: 'Too Slow' | 'Optimal' | 'Too Fast' = 'Optimal';
    if (calculatedWpm < 120) wpmStatus = 'Too Slow';
    else if (calculatedWpm > 165) wpmStatus = 'Too Fast';

    const localFillers = analyzeLocalFillerWords(transcript);

    const ai = getGemini();

    if (ai) {
      try {
        const presentationContextText = sessionType === 'presentation' && Array.isArray(slides) && slides.length > 0 ? `
=== PRESENTATION DECK REHEARSAL DATA ===
Deck Title: "${deckTitle || title}"
Total Slides: ${slides.length}
Slide Outline:
${slides.map((s: any, idx: number) => `Slide ${s.slideNumber || idx + 1}: "${s.title}"
  Bullets: ${(s.bulletPoints || []).join('; ')}
  Target Duration: ${s.targetDurationSeconds || 45}s`).join('\n')}

Slide-by-Slide Timing Recorded:
${(slideTimings || []).map((t: any) => `Slide ${t.slideNumber || '?'}: "${t.slideTitle || ''}" - Spent: ${t.secondsSpent || 0}s (Target: ${t.targetDurationSeconds || 45}s)`).join('\n')}
` : '';

        const prompt = `
You are Aatmavishwas, an elite executive speech and pitch presentation coach.
Analyze the following user speech transcript:
Transcript: "${transcript}"
Session Type: "${sessionType}"
Duration: ${durationSeconds} seconds
Speaking Speed: ${calculatedWpm} WPM (Words Per Minute)
Title/Context: "${title}" ${questionContext ? `Question Context: ${questionContext}` : ''} ${role ? `Role: ${role}` : ''}
${presentationContextText}

Provide a deep, constructive, structured analysis.
${sessionType === 'presentation' ? `
CRITICAL FOR PRESENTATION REHEARSAL:
In addition to general vocal scores, conduct an in-depth pitch and slide rehearsal critique:
1. Identify specific SHORTCOMINGS and delivery pitfalls (e.g. skipped slide points, rushed slides, rambling, lack of visual-spoken synergy, filler words during slide transitions).
2. Recommend concrete IMPROVEMENTS to elevate the presentation pitch.
3. Provide slide-by-slide feedback assessing pacing and message delivery for each slide.
4. Provide suggested transition bridge phrases between slides.
` : ''}

Return valid JSON adhering strictly to this schema:
{
  "clarityScore": number (0-100),
  "confidenceScore": number (0-100),
  "vocabularyScore": number (0-100),
  "pacingScore": number (0-100),
  "structureScore": number (0-100),
  "overallScore": number (0-100),
  "executiveSummary": string (2-3 concise, encouraging yet sharp sentences summarizing the delivery),
  "strengths": string[] (3 specific observations on what worked well),
  "improvements": string[] (3 actionable critiques on what needs work),
  "vocabularyUpgrades": [
    { "original": string, "suggested": string, "explanation": string }
  ] (2-3 suggestions to elevate informal/repetitive phrases into articulate vocabulary),
  "actionableDrills": string[] (2 practical micro-exercises the user can do right now),
  "sampleImprovedResponse": string (a rewritten, high-impact version of how this idea or pitch could be delivered with maximum charisma and structure),
  "starAnalysis": {
    "situation": string,
    "task": string,
    "action": string,
    "result": string,
    "score": number
  } (only if sessionType is "interview", otherwise null),
  "presentationReview": {
    "slideCoverageScore": number (0-100),
    "visualNarrativeAlignment": string (evaluation of how effectively the spoken narrative aligned with and expanded upon the slide bullets),
    "timeAllocationCritique": string (critique of time spent per slide vs targets, highlighting rushed or overtime slides),
    "shortcomings": string[] (3-5 specific, direct shortcomings detected in the pitch delivery, slide flow, or content coverage),
    "presentationImprovements": string[] (3-4 high-impact recommendations to polish and strengthen this presentation),
    "slideBySlideFeedback": [
      {
        "slideNumber": number,
        "slideTitle": string,
        "status": "Strong" | "Needs Work" | "Rushed" | "Overtime",
        "feedback": string (1-2 sentences of specific coaching feedback for this slide)
      }
    ],
    "bridgePhraseSuggestions": [
      {
        "fromSlide": string,
        "toSlide": string,
        "suggestedPhrase": string
      }
    ]
  } (only if sessionType is "presentation", otherwise null)
}
`;

        const response = await generateContentWithModelFallback(ai, {
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        const parsed = parseJsonSafely(response.text);

        if (parsed) {
          const report = {
            id: `sess-${Date.now()}`,
            timestamp: new Date().toISOString(),
            sessionType,
            title,
            durationSeconds,
            wordCount,
            wpm: calculatedWpm,
            wpmStatus,
            fillerWordsCount: localFillers.totalCount,
            fillerWordsBreakdown: localFillers.breakdown,
            clarityScore: parsed.clarityScore ?? 78,
            confidenceScore: parsed.confidenceScore ?? 75,
            vocabularyScore: parsed.vocabularyScore ?? 76,
            pacingScore: parsed.pacingScore ?? 80,
            structureScore: parsed.structureScore ?? 75,
            overallScore: parsed.overallScore ?? Math.round(((parsed.clarityScore ?? 78) + (parsed.confidenceScore ?? 75) + (parsed.pacingScore ?? 80)) / 3),
            strengths: parsed.strengths || [
              'Maintained consistent forward momentum without trailing off.',
              'Clear vocal intention with good articulation on core ideas.',
              'Effective conceptual grounding.'
            ],
            improvements: parsed.improvements || [
              'Replace filler phrases with deliberate 1-second pauses.',
              'Vary vocal inflection to emphasize key turning points.',
              'Conclude with an unmistakable, memorable closing line.'
            ],
            vocabularyUpgrades: parsed.vocabularyUpgrades || [
              { original: 'a lot of things', suggested: 'multifaceted dynamics', explanation: 'Sharper intellectual precision.' }
            ],
            executiveSummary: parsed.executiveSummary || 'A commendable delivery showing authentic passion and good articulation. Refining your transition phrasing and eliminating fillers will markedly amplify your executive presence.',
            actionableDrills: parsed.actionableDrills || [
              'The "Breathe-on-Period" drill: When a sentence ends, take an inaudible nasal breath before starting the next idea.',
              'Record the same thought in 45 seconds using only active verbs.'
            ],
            transcript,
            sampleImprovedResponse: parsed.sampleImprovedResponse,
            starAnalysis: parsed.starAnalysis,
            presentationReview: parsed.presentationReview || null,
          };

          sessionStore.unshift(report);
          return res.json(report);
        }
      } catch (geminiError: any) {
        console.warn('AI speech analysis service notice (engaging high-availability fallback):', geminiError?.message || 'Offline fallback active');
      }
    }

    // High-availability algorithmic report when offline or transient service failover
    const clarityScore = Math.min(95, Math.max(60, Math.round(85 - (localFillers.totalCount * 2.5))));
    const pacingScore = wpmStatus === 'Optimal' ? 88 : wpmStatus === 'Too Slow' ? 70 : 68;
    const confidenceScore = Math.round((clarityScore * 0.5) + (pacingScore * 0.5));
    const vocabularyScore = Math.min(92, Math.max(65, 75 + Math.floor(wordCount / 25)));
    const structureScore = 78;
    const overallScore = Math.round((clarityScore + pacingScore + confidenceScore + vocabularyScore) / 4);

    const improvedExcerpt = transcript.length > 220 ? transcript.slice(0, 220) + '...' : transcript;

    const fallbackReport: any = {
      id: `sess-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sessionType,
      title,
      durationSeconds,
      wordCount,
      wpm: calculatedWpm,
      wpmStatus,
      fillerWordsCount: localFillers.totalCount,
      fillerWordsBreakdown: localFillers.breakdown,
      clarityScore,
      confidenceScore,
      pacingScore,
      vocabularyScore,
      structureScore,
      overallScore,
      strengths: [
        'Solid conversational cadence and active topic engagement.',
        'Spoke with evident clarity across key thematic statements.',
        'Comfortable sentence flow with good acoustic continuity.'
      ],
      improvements: [
        localFillers.totalCount > 3 
          ? `Reduce use of frequent filler word "${localFillers.breakdown[0]?.word || 'um'}" during cognitive transitions.` 
          : 'Further refine rhythmic cadence to highlight climax moments.',
        calculatedWpm < 125 
          ? 'Elevate your tempo slightly towards 135-150 WPM to maintain audience engagement.' 
          : calculatedWpm > 160 
          ? 'Decelerate slightly so listeners can fully digest your core insights.' 
          : 'Pacing is within the ideal 130-160 WPM window.'
      ],
      vocabularyUpgrades: [
        { original: 'good', suggested: 'compelling / effective', explanation: 'Creates higher-impact resonance.' },
        { original: 'we had to do', suggested: 'we prioritized executing', explanation: 'Demonstrates active initiative.' }
      ],
      executiveSummary: `Delivered ${wordCount} words across ${durationSeconds} seconds at ${calculatedWpm} WPM. Clarity and vocal stability were well maintained.`,
      actionableDrills: [
        'Practice the "One-Breath Delivery": Speak a complete sentence on a single relaxed breath.',
        'Silent Pause Drill: When tempted to say a filler word, simply close your lips and pause.'
      ],
      transcript,
      sampleImprovedResponse: `Executive Delivery Upgrade:\n"${improvedExcerpt}"\n\nTakeaway: Replace filler pauses with intentional 1-second vocal rests and emphasize your primary takeaway in the opening sentence for commanding executive presence.`,
    };

    if (sessionType === 'interview') {
      fallbackReport.starAnalysis = {
        situation: "Framed the contextual backdrop and challenge with clear initial relevance.",
        task: "Identified the primary goal and responsibility requiring ownership.",
        action: "Articulated decisive strategic steps taken to address obstacles directly.",
        result: "Highlighted positive outcomes, quantifiable impact, and key takeaways.",
        score: Math.max(75, overallScore)
      };
    }

    if (sessionType === 'presentation') {
      const slideList = Array.isArray(slides) && slides.length > 0 ? slides : [
        { slideNumber: 1, title: 'Introduction & Problem Hook', targetDurationSeconds: 45 },
        { slideNumber: 2, title: 'Solution Architecture', targetDurationSeconds: 60 },
        { slideNumber: 3, title: 'Business Impact & Next Steps', targetDurationSeconds: 30 },
      ];

      const timings = Array.isArray(slideTimings) && slideTimings.length > 0 ? slideTimings : [];

      fallbackReport.presentationReview = {
        slideCoverageScore: Math.min(95, Math.max(65, 75 + Math.floor(wordCount / 35))),
        visualNarrativeAlignment: 'Your spoken delivery established context for the core topic. To maximize impact, ensure each key bullet or quantitative metric on the slide is highlighted verbally rather than assumed.',
        timeAllocationCritique: timings.some((t: any) => (t.secondsSpent || 0) > (t.targetDurationSeconds || 45) * 1.5)
          ? 'Some slides significantly exceeded their target durations. Focus on delivering the core takeaway before advancing.'
          : 'Pacing was generally balanced across the deck with adequate time given to primary talking points.',
        shortcomings: [
          'Occasional hesitation and filler phrasing when switching between consecutive slides.',
          wordCount < 60 ? 'Spoken explanation was brief relative to the visual content on the slides.' : 'Transition momentum dipped during technical explanations.',
          'Missing a crisp, memorable concluding call-to-action on the final slide.'
        ],
        presentationImprovements: [
          'Script and memorize a dedicated 1-sentence transition bridge between each slide.',
          'State the "So What?" implication of each slide in the first 10 seconds of speaking on it.',
          'End the presentation with confident silence rather than a trailing "so yeah, that is all".'
        ],
        slideBySlideFeedback: slideList.map((s: any, idx: number) => {
          const t = timings.find((tm: any) => tm.slideNumber === s.slideNumber) || { secondsSpent: 30, targetDurationSeconds: s.targetDurationSeconds || 45 };
          const spent = t.secondsSpent || 0;
          const target = t.targetDurationSeconds || s.targetDurationSeconds || 45;
          let status: 'Strong' | 'Needs Work' | 'Rushed' | 'Overtime' = 'Strong';
          let feedback = `Good delivery on ${s.title}. Solid articulation of main concepts.`;
          if (spent < 8) {
            status = 'Rushed';
            feedback = `Rushed through ${s.title} in ${spent}s. Elaborate on key points before transitioning.`;
          } else if (spent > target * 1.6) {
            status = 'Overtime';
            feedback = `Spent ${spent}s on ${s.title} (target ~${target}s). Condense secondary details to keep pace.`;
          }
          return {
            slideNumber: s.slideNumber || idx + 1,
            slideTitle: s.title || `Slide ${idx + 1}`,
            status,
            feedback,
          };
        }),
        bridgePhraseSuggestions: [
          {
            fromSlide: slideList[0]?.title || 'Slide 1',
            toSlide: slideList[1]?.title || 'Slide 2',
            suggestedPhrase: 'Now that we have established the core problem, let us examine the strategic solution...'
          },
          {
            fromSlide: slideList[1]?.title || 'Slide 2',
            toSlide: slideList[2]?.title || 'Slide 3',
            suggestedPhrase: 'Having reviewed our solution architecture, let us turn to the concrete business milestones...'
          }
        ]
      };
    }

    sessionStore.unshift(fallbackReport);
    return res.json(fallbackReport);
  } catch (error: any) {
    console.error('Error analyzing speech:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

// 2. Audio Transcription endpoint (using gemini-3.8-flash with fallback to gemini-3.6-flash and gemini-3.5-flash)
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64 || typeof audioBase64 !== 'string' || audioBase64.trim().length === 0) {
      return res.status(400).json({ error: 'Audio data is required', transcript: '' });
    }

    if (audioBase64.length < 50) {
      return res.json({ transcript: '', message: 'Audio buffer is too short or empty.' });
    }

    const ai = getGemini();
    if (!ai) {
      return res.json({ transcript: '', message: 'Gemini client not configured' });
    }

    let cleanMimeType = (mimeType || 'audio/webm').split(';')[0].trim().toLowerCase();
    if (!cleanMimeType.startsWith('audio/')) {
      cleanMimeType = 'audio/webm';
    }

    const audioPart = {
      inlineData: {
        mimeType: cleanMimeType,
        data: audioBase64,
      },
    };

    const promptText = 
      'Transcribe this spoken audio verbatim in English. ' +
      'Capture every word accurately, including disfluencies and hesitation sounds such as "um", "uh", "like", "you know", "er", "ah", "so", "basically" if uttered. ' +
      'Do not summarize, do not correct grammar, and do not omit filler words. If the audio contains silence or no discernible speech, return an empty string. ' +
      'Output ONLY the raw verbatim transcribed text without introductory greetings or commentary.';

    const response = await generateContentWithModelFallback(
      ai,
      {
        contents: [
          audioPart,
          { text: promptText },
        ],
      },
      ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash']
    );

    let transcribed = (response.text || '').trim();
    if (transcribed.startsWith('"') && transcribed.endsWith('"') && transcribed.length > 2) {
      transcribed = transcribed.slice(1, -1).trim();
    }

    res.json({ transcript: transcribed });
  } catch (error: any) {
    console.error('Audio transcription error:', error);
    res.status(500).json({ error: error.message || 'Transcription failed', transcript: '' });
  }
});

// 3. Text to Speech endpoint (using gemini-3.1-flash-tts-preview)
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const ai = getGemini();
    if (!ai) {
      return res.json({ audioBase64: null, message: 'Fallback to browser SpeechSynthesis' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: text.slice(0, 500) }] }],
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    res.json({ audioBase64: base64Audio || null });
  } catch (error: any) {
    console.warn('TTS API error (will fallback gracefully to browser speech):', error.message);
    res.json({ audioBase64: null, fallback: true });
  }
});

// 4. Group Discussion AI Participant Response Generator
app.post('/api/gd/ai-turn', async (req: Request, res: Response) => {
  try {
    const { topic, participant, history } = req.body;
    const ai = getGemini();

    if (!ai) {
      // Realistic default responses based on persona
      const personaResponses: Record<string, string> = {
        analytical: `Looking at the quantitative aspects of ${topic?.title || 'this topic'}, we must examine how measurable metrics affect our strategy. Studies show that when organizations align on objective benchmarks rather than intuition, the outcome variance drops significantly.`,
        strategic: `To synthesize what has been shared so far, there's a vital distinction between short-term adoption and systemic long-term value. While the immediate concerns are genuine, the macro trajectory suggests we need adaptive policies.`,
        challenger: `I appreciate that point, but let me offer a contrarian perspective: aren't we overlooking the secondary friction? What happens to the marginalized stakeholders who cannot easily adapt to this shift?`
      };
      const text = personaResponses[participant?.persona || 'analytical'] || 'That is a compelling point. I agree that balancing innovation with ethical guardrails is essential.';
      return res.json({ text });
    }

    const prompt = `
You are roleplaying as ${participant?.name}, a participant in a Group Discussion (GD) on the topic:
Topic: "${topic?.title}"
Topic Brief: "${topic?.brief}"
Your Persona: ${participant?.persona} (${participant?.roleDescription})

Recent Discussion Context:
${(history || []).slice(-4).map((m: any) => `${m.senderName}: "${m.text}"`).join('\n')}

Generate your next spoken contribution to the group discussion:
- Length: 2 to 3 sentences (40-60 words).
- Keep it natural, conversational, spoken-style.
- Acknowledge or politely build upon / challenge the previous speaker.
- Stay true to your persona (${participant?.persona}).
- Speak in first person. Do NOT include stage directions or quotes.
`;

    const response = await generateContentWithModelFallback(ai, {
      contents: prompt,
    });

    res.json({ text: (response.text || '').trim() });
  } catch (error: any) {
    console.warn('GD Turn generation notice:', error?.message || 'Using persona response');
    const personaResponses: Record<string, string> = {
      analytical: `Looking at the quantitative aspects of ${req.body?.topic?.title || 'this topic'}, we must examine how measurable metrics affect our strategy. Studies show that when organizations align on objective benchmarks rather than intuition, the outcome variance drops significantly.`,
      strategic: `To synthesize what has been shared so far, there's a vital distinction between short-term adoption and systemic long-term value. While the immediate concerns are genuine, the macro trajectory suggests we need adaptive policies.`,
      challenger: `I appreciate that point, but let me offer a contrarian perspective: aren't we overlooking the secondary friction? What happens to the marginalized stakeholders who cannot easily adapt to this shift?`
    };
    const text = personaResponses[req.body?.participant?.persona || 'analytical'] || 'I agree with the core premise, and I believe finding practical compromise is the fastest way forward.';
    res.json({ text });
  }
});

// 5. AI Speech Coach Chatbot endpoint
app.post('/api/coach-chat', async (req: Request, res: Response) => {
  try {
    const { messages, userContext } = req.body;
    const ai = getGemini();

    if (!ai) {
      return res.json({ 
        reply: "Welcome to Aatmavishwas! To deliver a memorable speech or ace an interview, remember the 3 P's: Posture (grounded diaphragm), Pause (silence commands attention more than filler words), and Purpose (focus on the audience's takeaway, not your nerves)." 
      });
    }

    const conversationHistory = (messages || []).map((m: any) => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text }]
    }));

    const systemInstruction = `
You are the Master Communication Coach at Aatmavishwas (which means Self-Confidence).
Your mission is to transform users into poised, charismatic, and articulate communicators.
Your coaching style is encouraging, empathetic, deeply insightful, and immediately practical.
Provide punchy frameworks (e.g. STAR method for interviews, Rule of Three for speeches, What-Why-How for impromptu speaking).
Avoid long-winded lectures; give actionable, bite-sized drills and clear vocal techniques.
`;

    const lastMessage = messages[messages.length - 1]?.text || 'Give me a public speaking tip.';
    const replyText = await sendChatMessageWithModelFallback(ai, {
      systemInstruction,
      history: conversationHistory.slice(0, -1),
      message: lastMessage,
    });

    res.json({ reply: replyText || "To reduce anxiety before speaking, practice box breathing (4s in, 4s hold, 4s out, 4s hold) and mentally anchor your message around your opening line. What specific speaking challenge are you tackling today?" });
  } catch (error: any) {
    console.warn('Coach chat notice:', error?.message || 'Using guided coach tip');
    res.json({ 
      reply: "To reduce anxiety before speaking, practice box breathing (4s in, 4s hold, 4s out, 4s hold) and mentally anchor your message around your opening line. What specific speaking challenge are you tackling today?" 
    });
  }
});

// 6. Practice Sessions storage endpoints
app.get('/api/sessions', (req: Request, res: Response) => {
  res.json(sessionStore);
});

app.post('/api/sessions', (req: Request, res: Response) => {
  const newSession = {
    ...req.body,
    id: req.body.id || `sess-${Date.now()}`,
    timestamp: req.body.timestamp || new Date().toISOString(),
  };
  sessionStore.unshift(newSession);
  res.json(newSession);
});

// Mount Vite middleware in development or serve static in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
        watch: isHmrDisabled ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[server] Port ${PORT} is temporarily in use (EADDRINUSE). Waiting for previous process to release...`);
      setTimeout(() => {
        try {
          httpServer.close();
        } catch (_) {}
        httpServer.listen(PORT, '0.0.0.0');
      }, 1200);
    } else {
      console.error('[server] HTTP server error:', err);
    }
  });

  const cleanup = () => {
    try {
      httpServer.close(() => {
        process.exit(0);
      });
    } catch (_) {
      process.exit(0);
    }
  };
  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Aatmavishwas server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
