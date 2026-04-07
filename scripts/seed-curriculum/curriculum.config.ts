// ─── Curriculum Config Types ────────────────────────────────────────────────

export interface TopicConfig {
  title: string;
  /**
   * If true, this topic is a graded project submission (PRACTICE type).
   * Learners must submit a GitHub repo and receive APPROVED status to advance.
   */
  isProject?: boolean;
  /**
   * External resource URL injected as the "Deep Dive" unlock after quiz completion.
   */
  externalUrl?: string;
  /**
   * Live documentation URLs to be fetched via Jina AI and injected into the 
   * Ollama system prompt as real-time RAG context. Use for fast-moving topics
   * that may be stale in Llama's training data.
   */
  sourceUrls?: string[];
}

export interface ModuleConfig {
  title: string;
  duration: number; // minutes
  topics: TopicConfig[];
}

export interface CourseConfig {
  title: string;
  description: string;
  shortDescription: string;
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  duration: number; // hours
  price: number;
  tags?: string[];
  learningOutcomes?: string[];
  modules: ModuleConfig[];
}

export interface TrackConfig {
  track: { title: string; slug: string };
  courses: CourseConfig[];
}

// ─── Curriculum Definition ───────────────────────────────────────────────────

export const CURRICULUM: TrackConfig[] = [
  {
    track: { title: "The Digital Foundation", slug: "digital-foundation" },
    courses: [
      {
        title: "How Computers Work: Under the Hood",
        description: "A gentle introduction to digital literacy, hardware, and how the internet actually functions.",
        shortDescription: "Understand the machine before you start building on it.",
        difficulty: "BEGINNER",
        duration: 5, // hours
        price: 0,
        tags: ["digital-literacy", "hardware", "networking", "beginner"],
        learningOutcomes: [
          "Explain the difference between hardware and software",
          "Describe how data travels across the internet",
          "Apply computational thinking to break down everyday problems",
        ],
        modules: [
          {
            title: "Module 1: The Tech Anatomy",
            duration: 120, // minutes
            topics: [
              {
                title: "Hardware vs Software: The Brain and the Body",
                sourceUrls: ["https://www.bbc.co.uk/bitesize/guides/z7qqmsg/revision/1"],
              },
              {
                title: "How the Internet Works: Servers and Clients",
                externalUrl: "https://www.youtube.com/watch?v=7_LPdttKXPc",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works"],
              },
            ],
          },
          {
            title: "Module 2: Soft Skills in Tech",
            duration: 120, // minutes
            topics: [
              { title: "Effective Communication for Developers" },
              { title: "Computational Thinking: Breaking Big Problems into Small Steps" },
            ],
          },
        ],
      },
      {
        title: "AI as a Partner",
        description: "Learn how to use AI as a highly capable intern rather than a magic trick.",
        shortDescription: "Introduction to LLMs and Prompt Engineering.",
        difficulty: "BEGINNER",
        duration: 4, // hours
        price: 0,
        tags: ["AI", "prompt-engineering", "LLM", "ChatGPT", "beginner"],
        learningOutcomes: [
          "Explain how large language models generate text",
          "Identify and verify AI hallucinations",
          "Write effective prompts using the Role + Task + Context formula",
        ],
        modules: [
          {
            title: "Module 1: Meet Your AI Intern",
            duration: 60, // minutes
            topics: [
              {
                title: "What are Large Language Models?",
                sourceUrls: [
                  "https://en.wikipedia.org/wiki/Large_language_model",
                  "https://www.cloudflare.com/learning/ai/what-is-a-large-language-model/",
                ],
              },
              {
                title: "Hallucinations and Fact-Checking",
                sourceUrls: ["https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)"],
              },
            ],
          },
          {
            title: "Module 2: Prompt Engineering 101",
            duration: 120, // minutes
            topics: [
              {
                title: "The Role + Task + Context Formula",
                sourceUrls: ["https://www.promptingguide.ai/introduction/basics"],
              },
              { title: "Iterative Prompting for Better Results" },
            ],
          },
        ],
      },
    ],
  },

  {
    track: { title: "Frontend Development", slug: "frontend-development" },
    courses: [
      {
        title: "HTML Foundations: The Bones of the Web",
        description: "Learn the core structure of the web by building your first web pages from scratch.",
        shortDescription: "Master HTML semantics without AI help (yet).",
        difficulty: "BEGINNER",
        duration: 8, // hours
        price: 0,
        tags: ["html", "web", "semantics", "beginner"],
        learningOutcomes: [
          "Build a complete HTML page using semantic elements",
          "Create accessible forms that collect user data",
          "Explain the DOM and how browsers parse HTML",
        ],
        modules: [
          {
            title: "Module 1: Getting Started",
            duration: 120, // minutes
            topics: [
              {
                title: "What is HTML and the DOM?",
                externalUrl: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"],
              },
              {
                title: "Basic Tags and Nesting",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax"],
              },
              { title: "Images and Links" },
            ],
          },
          {
            title: "Module 2: Structure and Semantics",
            duration: 180, // minutes
            topics: [
              {
                title: "Building Forms to Collect Data",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form"],
              },
              {
                title: "Semantic HTML: Header, Main, Footer",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Glossary/Semantics"],
              },
              { title: "Project: Personal Profile Page", isProject: true },
            ],
          },
        ],
      },
      {
        title: "CSS Mastery: The Skin of the Web",
        description: "Style your foundational HTML with colors, layouts, and typography.",
        shortDescription: "Learn Flexbox, Grid, and the Cascade.",
        difficulty: "BEGINNER",
        duration: 10, // hours
        price: 0,
        tags: ["css", "flexbox", "grid", "responsive", "beginner"],
        learningOutcomes: [
          "Apply the CSS Box Model to control spacing and sizing",
          "Build responsive layouts using Flexbox and CSS Grid",
          "Write media queries for mobile-first designs",
        ],
        modules: [
          {
            title: "Module 1: Styling Basics",
            duration: 120, // minutes
            topics: [
              {
                title: "The Box Model",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model"],
              },
              {
                title: "Understanding the Cascade and Specificity",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity"],
              },
            ],
          },
          {
            title: "Module 2: Modern Layouts",
            duration: 200, // minutes
            topics: [
              {
                title: "Flexbox Fundamentals",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox"],
              },
              {
                title: "CSS Grid for Advanced Layouts",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids"],
              },
              {
                title: "Responsive Design and Media Queries",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design"],
              },
            ],
          },
        ],
      },
      {
        title: "Vanilla JavaScript: The Engine",
        description: "Add interactivity to your static pages with pure JavaScript.",
        shortDescription: "Logic, events, and true programming.",
        difficulty: "INTERMEDIATE",
        duration: 15, // hours
        price: 0,
        tags: ["javascript", "DOM", "events", "intermediate"],
        learningOutcomes: [
          "Write functions and control flow using core JS syntax",
          "Manipulate the DOM to update pages dynamically",
          "Handle user interactions with event listeners",
        ],
        modules: [
          {
            title: "Module 1: Core Logic",
            duration: 180, // minutes
            topics: [
              {
                title: "Variables and Data Types",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types"],
              },
              {
                title: "Functions and Scope",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions"],
              },
              {
                title: "If/Else Statements and Loops",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling"],
              },
            ],
          },
          {
            title: "Module 2: The Browser Interface",
            duration: 200, // minutes
            topics: [
              {
                title: "Manipulating the DOM",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting"],
              },
              {
                title: "Listening for Events (Clicks, Inputs)",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events"],
              },
            ],
          },
        ],
      },
      {
        title: "React Fundamentals",
        description: "Move from manual DOM updates to modern component-based architecture.",
        shortDescription: "The industry standard for UIs.",
        difficulty: "INTERMEDIATE",
        duration: 12, // hours
        price: 0,
        tags: ["react", "components", "hooks", "jsx", "intermediate"],
        learningOutcomes: [
          "Build reusable React components using JSX",
          "Manage dynamic UI state with useState and useEffect",
          "Understand React 19's Server Components model",
        ],
        modules: [
          {
            title: "Module 1: The React Mental Model",
            duration: 150, // minutes
            topics: [
              {
                title: "What are Components?",
                sourceUrls: ["https://react.dev/learn/your-first-component"],
              },
              {
                title: "JSX: Combining HTML and JS",
                sourceUrls: ["https://react.dev/learn/writing-markup-with-jsx"],
              },
            ],
          },
          {
            title: "Module 2: Managing Change",
            duration: 180, // minutes
            topics: [
              {
                title: "State Updates with useState",
                sourceUrls: ["https://react.dev/reference/react/useState"],
              },
              {
                title: "Side Effects with useEffect",
                sourceUrls: ["https://react.dev/reference/react/useEffect"],
              },
              {
                title: "React 19: Server Components",
                sourceUrls: ["https://react.dev/reference/rsc/server-components"],
              },
            ],
          },
        ],
      },
    ],
  },
];
