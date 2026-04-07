const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL_NAME = "llama3.2"; // Can be changed based on what is pulled

type OllamaResponse = {
  response: string;
};

async function callOllama(systemContent: string, prompt: string, formatJSON: boolean = false): Promise<string> {
  const reqBody: any = {
    model: MODEL_NAME,
    system: systemContent,
    prompt: prompt,
    stream: false,
    options: {
      temperature: 0.7,
    }
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
    if (err.cause?.code === 'ECONNREFUSED') {
       throw new Error(`Could not connect to Ollama at ${OLLAMA_URL}. Is it running?`);
    }
    throw err;
  }
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
  isProject: boolean = false
): Promise<GeneratedTopicData> {
  console.log(`[Ollama] 🔄 CALL 1: Generating Lesson for "${topicTitle}"...`);
  
  const systemLesson = `You are a distinguished senior tech educator and award-winning curriculum developer 
who has dedicated your career to crafting curricula recognized globally for clarity, 
pedagogical excellence, and measurable student outcomes.
You write for secondary school graduates who have ZERO prior tech experience.
Your tone is warm, confident, and uses vivid, Nigeria-relevant real-world analogies.`;

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

  let lessonContent = await callOllama(systemLesson, promptLesson);
  if (externalUrl) {
    lessonContent = lessonContent.replace("[EXTERNAL_URL]", externalUrl);
  } else {
    // If no external URL provided in config, just remove the placeholder literal
    lessonContent = lessonContent.replace("[EXTERNAL_URL]", "the next module");
  }

  console.log(`[Ollama] 🔄 CALL 2: Generating Quiz for "${topicTitle}"...`);

  const systemQuiz = `You are a distinguished senior course developer and assessment architect with 
decades of experience designing award-winning standardized tests and formative assessments.
You return ONLY valid, parseable JSON. No prose. No markdown limits like \`\`\`json. Pure JSON String.`;

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

  const quizJSONText = await callOllama(systemQuiz, promptQuiz, true);
  let quizData;
  try {
    quizData = JSON.parse(quizJSONText);
    // Sanity check
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
        throw new Error("Invalid format returned by Ollama JSON mode for quiz.");
    }
  } catch (err) {
    console.error("Failed to parse quiz JSON:", quizJSONText);
    throw new Error("Ollama returned invalid JSON for quiz.");
  }

  console.log(`[Ollama] 🔄 CALL 3: Editorial Review for "${topicTitle}"...`);

  const systemReview = `You are a chief curriculum quality assessor for a premium online learning platform.
You evaluate educational content for three dimensions:
- ELEGANCE: Is the language clear, warm, and free of jargon?
- EFFECTIVENESS: Does the content build genuine understanding, not just surface recall?
- EFFICIENCY: Is the content appropriately concise without losing depth?
You return ONLY valid, parseable JSON. No prose. No markdown limits like \`\`\`json.`;

  const promptReview = `Review the following lesson AND its quiz questions. 

LESSON:
${lessonContent}

QUIZ:
${JSON.stringify(quizData, null, 2)}

Return a JSON object only:
{
  "score": { "elegance": 8, "effectiveness": 8, "efficiency": 8 },
  "lessonRevised": "...(if any score is < 8, provide improved full lesson text, else hold null)...",
  "quizRevised": null,
  "flags": ["list of any factual concerns or items needing human review due to date/knowledge limits"]
}`;

  const reviewJSONText = await callOllama(systemReview, promptReview, true);
  let reviewData;
  let finalLessonContent = lessonContent;
  let finalQuizData = quizData;
  let finalFlags: string[] = [];

  try {
    reviewData = JSON.parse(reviewJSONText);
    const avgScore = (reviewData.score.elegance + reviewData.score.effectiveness + reviewData.score.efficiency) / 3;
    
    if (avgScore < 8 && reviewData.lessonRevised) {
      finalLessonContent = reviewData.lessonRevised;
      console.log(`[Ollama] ✨ Replaced lesson with revised version (Score: ${avgScore.toFixed(1)})`);
    }

    if (reviewData.quizRevised) {
      finalQuizData = reviewData.quizRevised;
      console.log(`[Ollama] ✨ Replaced quiz with revised version.`);
    }

    if (reviewData.flags && Array.isArray(reviewData.flags)) {
      finalFlags = reviewData.flags;
    }
  } catch (err) {
    console.error("Failed to parse review JSON, using initial drafts.");
  }

  return {
    lessonContent: finalLessonContent,
    quizData: finalQuizData,
    flags: finalFlags,
  };
}
