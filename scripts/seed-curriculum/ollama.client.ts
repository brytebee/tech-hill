const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "llama3.2"; // Can be changed based on what is pulled

type OllamaResponse = {
  response: string;
};

type OllamaCallOptions = {
  temperature?: number;
  numCtx?: number;
  formatJSON?: boolean;
};

async function callOllama(
  systemContent: string,
  prompt: string,
  options: OllamaCallOptions = {}
): Promise<string> {
  const { temperature = 0.7, numCtx, formatJSON = false } = options;

  const reqBody: any = {
    model: MODEL_NAME,
    system: systemContent,
    prompt: prompt,
    stream: false,
    options: {
      temperature,
      ...(numCtx ? { num_ctx: numCtx } : {}),
    },
  };

  if (formatJSON) {
    reqBody.format = "json";
  }

  try {
    const res = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reqBody),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ollama returned status ${res.status}: ${errorText}`);
    }

    const data: OllamaResponse = await res.json();
    return data.response;
  } catch (err: any) {
    if (err.cause?.code === "ECONNREFUSED") {
      throw new Error(`Could not connect to Ollama at ${OLLAMA_URL}. Is it running?`);
    }
    throw err;
  }
}

/**
 * Safely extracts a JSON object from a string that may contain extra prose.
 * Prevents JSON.parse from failing when Ollama adds surrounding text.
 */
function extractJSON(text: string): string {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`No JSON object found in Ollama response:\n${text.slice(0, 300)}`);
  return match[0];
}

export type GeneratedTopicData = {
  lessonContent: string;
  quizData: any;
  flags: string[];
};

export async function generateTopicContent(
  topicTitle: string,
  courseTitle: string,
  externalUrl?: string,
  isProject: boolean = false,
  liveContext?: string
): Promise<GeneratedTopicData> {
  // Use expanded context window when live RAG data is injected
  const contextWindow = liveContext ? 8192 : 4096;

  console.log(`[Ollama] 🔄 CALL 1: Generating Lesson for "${topicTitle}"...`);

  const systemLesson =
    `You are a distinguished senior tech educator and award-winning curriculum developer ` +
    `who has dedicated your career to crafting curricula recognized globally for clarity, ` +
    `pedagogical excellence, and measurable student outcomes.\n` +
    `You write for secondary school graduates who have ZERO prior tech experience.\n` +
    `Your tone is warm, confident, and uses vivid, Nigeria-relevant real-world analogies.` +
    (liveContext
      ? `\n\nCRITICAL DIRECTIVE: Ignore any contradictory internal knowledge. ` +
        `Using ONLY the real-time documentation context attached below, formulate the requested lesson. ` +
        `Rely entirely on this fresh context instead of your internal training weights.\n\n` +
        `--- INGESTED LIVE CONTEXT ---\n${liveContext}\n------------------------------`
      : "");

  const promptLesson = isProject
    ? `Write a structured hands-on Project Brief on "${topicTitle}" for the course "${courseTitle}".
The brief must:
1. Open with a "Project Overview" using a real-world Nigerian tech analogy (e.g., building a system for a Lagos business).
2. Cover 3-4 numbered sections including "Technical Requirements", "Starter Context", and "Acceptance Criteria" with a bold heading each.
3. End with a locked "🔒 Deep Dive Resource" placeholder: 
   "Complete the quiz below to unlock your guided external practice on [EXTERNAL_URL]"
4. Skip traditional theory and focus entirely on practical application.
5. Flag any content that may be outdated or AI-specific with: [VERIFY THIS: ...]
6. Target length: 300-450 words. Return cleanly formatted text (markdown allowed).`
    : `Write a structured lesson on "${topicTitle}" for the course "${courseTitle}".
The lesson must:
1. Open with a 1-paragraph "What & Why" hook using a real-world Nigerian analogy.
2. Cover 3-4 numbered sections with a bold heading each.
3. Include ONE practical "Try It Yourself" exercise that can be completed in under 10 mins.
4. End with a locked "🔒 Deep Dive Resource" placeholder: 
   "Complete the quiz below to unlock your guided external practice on [EXTERNAL_URL]"
5. Flag any content that may be outdated or AI-specific with: [VERIFY THIS: ...]
6. Target length: 300-450 words. Return cleanly formatted text (markdown allowed).`;

  let lessonContent = await callOllama(systemLesson, promptLesson, {
    temperature: 0.7, // Creative writing: higher temp is appropriate
    numCtx: contextWindow,
  });

  // Replace placeholder URL or fallback
  if (externalUrl) {
    lessonContent = lessonContent.replace("[EXTERNAL_URL]", externalUrl);
  } else {
    lessonContent = lessonContent.replace("[EXTERNAL_URL]", "the next module");
  }

  // Warn if the placeholder wasn't consumed (Llama formatted it differently)
  if (lessonContent.includes("[EXTERNAL_URL]")) {
    console.warn(`[Ollama] ⚠️ [EXTERNAL_URL] placeholder was not replaced in "${topicTitle}". Ollama may have rephrased it.`);
  }

  console.log(`[Ollama] 🔄 CALL 2: Generating Quiz for "${topicTitle}"...`);

  const systemQuiz =
    `You are a distinguished senior course developer and assessment architect with ` +
    `decades of experience designing award-winning standardized tests and formative assessments.\n` +
    `You return ONLY valid, parseable JSON. No prose. No markdown fences like \`\`\`json. Pure JSON only.`;

  const promptQuiz = `Based on the lesson content below, generate exactly 3 multiple-choice quiz questions 
that test conceptual understanding, NOT memorization.

LESSON CONTENT:
${lessonContent}

Return this exact JSON structure:
{
  "passingScore": 80,
  "questions": [{
    "text": "...",
    "explanation": "Why this answer is correct and the others are not...",
    "difficulty": "EASY",
    "options": [
      { "text": "...", "isCorrect": false },
      { "text": "...", "isCorrect": true },
      { "text": "...", "isCorrect": false },
      { "text": "...", "isCorrect": false }
    ]
  }]
}`;

  const quizRawText = await callOllama(systemQuiz, promptQuiz, {
    temperature: 0.3, // Assessment: low temp for accuracy
    numCtx: contextWindow,
    formatJSON: true,
  });

  let quizData;
  try {
    const quizJSONStr = extractJSON(quizRawText);
    quizData = JSON.parse(quizJSONStr);
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid format: `questions` array is missing.");
    }
  } catch (err: any) {
    console.error(`[Ollama] ❌ Failed to parse quiz JSON for "${topicTitle}":`, err.message);
    console.error("Raw text:", quizRawText.slice(0, 500));
    throw new Error(`Ollama returned invalid JSON for quiz: ${err.message}`);
  }

  console.log(`[Ollama] 🔄 CALL 3: Editorial Review for "${topicTitle}"...`);

  const systemReview =
    `You are a chief curriculum quality assessor for a premium online learning platform.\n` +
    `You evaluate educational content for three dimensions:\n` +
    `- ELEGANCE: Is the language clear, warm, and free of jargon?\n` +
    `- EFFECTIVENESS: Does the content build genuine understanding, not just surface recall?\n` +
    `- EFFICIENCY: Is the content appropriately concise without losing depth?\n` +
    `You return ONLY valid, parseable JSON. No prose. No markdown fences.`;

  const promptReview = `Review the following lesson and its quiz questions. 

LESSON:
${lessonContent}

QUIZ:
${JSON.stringify(quizData, null, 2)}

Return a JSON object only:
{
  "score": { "elegance": 8, "effectiveness": 8, "efficiency": 8 },
  "lessonRevised": null,
  "quizRevised": null,
  "flags": ["list of any factual concerns or items needing human review due to date/knowledge limits"]
}
If any score dimension is < 8, provide the full revised lesson (as a string) in "lessonRevised". Otherwise set it to null. Ensure lessonRevised is a direct string, NOT an object.`;

  const reviewRawText = await callOllama(systemReview, promptReview, {
    temperature: 0.3, // Review: deterministic scoring
    numCtx: contextWindow,
    formatJSON: true,
  });

  let finalLessonContent = lessonContent;
  let finalQuizData = quizData;
  let finalFlags: string[] = [];

  try {
    const reviewJSONStr = extractJSON(reviewRawText);
    const reviewData = JSON.parse(reviewJSONStr);
    const avgScore =
      (reviewData.score.elegance + reviewData.score.effectiveness + reviewData.score.efficiency) / 3;

    if (avgScore < 8 && reviewData.lessonRevised) {
      if (typeof reviewData.lessonRevised === 'string') {
        finalLessonContent = reviewData.lessonRevised;
        console.log(`[Ollama] ✨ Replaced lesson with revised version (avg score: ${avgScore.toFixed(1)})`);
      } else if (typeof reviewData.lessonRevised === 'object' && reviewData.lessonRevised.text) {
        finalLessonContent = reviewData.lessonRevised.text;
        console.log(`[Ollama] ✨ Replaced lesson with revised version (extracted from object)`);
      }
    }

    if (reviewData.quizRevised) {
      finalQuizData = reviewData.quizRevised;
      console.log(`[Ollama] ✨ Replaced quiz with revised version.`);
    }

    if (reviewData.flags && Array.isArray(reviewData.flags)) {
      finalFlags = reviewData.flags;
    }
  } catch (err) {
    // Review failure is non-fatal — we use the initial drafts
    console.warn(`[Ollama] ⚠️ Editorial review parse failed for "${topicTitle}". Using initial drafts.`);
  }

  return {
    lessonContent: finalLessonContent,
    quizData: finalQuizData,
    flags: finalFlags,
  };
}

/**
 * Standalone quiz generator — runs only Ollama Call 2.
 * Used when a topic already exists in the DB but has no quiz (patch mode).
 * Accepts the existing lesson content as context so no lesson is regenerated.
 */
export async function generateQuizOnly(
  topicTitle: string,
  lessonContent: string
): Promise<any> {
  console.log(`[Ollama] 🔄 CALL 2 (patch): Generating Quiz for "${topicTitle}"...`);

  const systemQuiz =
    `You are a distinguished senior course developer and assessment architect with ` +
    `decades of experience designing award-winning standardized tests and formative assessments.\n` +
    `You return ONLY valid, parseable JSON. No prose. No markdown fences like \`\`\`json. Pure JSON only.`;

  const promptQuiz = `Based on the lesson content below, generate exactly 3 multiple-choice quiz questions 
that test conceptual understanding, NOT memorization.

LESSON CONTENT:
${lessonContent}

Return this exact JSON structure:
{
  "passingScore": 80,
  "questions": [{
    "text": "...",
    "explanation": "Why this answer is correct and the others are not...",
    "difficulty": "EASY",
    "options": [
      { "text": "...", "isCorrect": false },
      { "text": "...", "isCorrect": true },
      { "text": "...", "isCorrect": false },
      { "text": "...", "isCorrect": false }
    ]
  }]
}`;

  const quizRawText = await callOllama(systemQuiz, promptQuiz, {
    temperature: 0.3,
    numCtx: 4096,
    formatJSON: true,
  });

  try {
    const quizJSONStr = extractJSON(quizRawText);
    const quizData = JSON.parse(quizJSONStr);
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error("Invalid format: `questions` array is missing.");
    }
    return quizData;
  } catch (err: any) {
    console.error(`[Ollama] ❌ Failed to parse quiz JSON for "${topicTitle}":`, err.message);
    throw new Error(`Ollama returned invalid JSON for quiz: ${err.message}`);
  }
}
