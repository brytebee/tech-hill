// ─── Curriculum Config Types ────────────────────────────────────────────────

export interface FurtherReadingLink {
  title: string;
  url: string;
  /** One-line explanation of what the learner will find at this link */
  description: string;
}

export interface TopicConfig {
  title: string;
  /**
   * If true, this topic is a graded project submission (PRACTICE type).
   * Learners must submit a GitHub repo and receive APPROVED status to advance.
   */
  isProject?: boolean;
  /**
   * External resource URL shown as the primary "Deep Dive" link on the topic page.
   */
  externalUrl?: string;
  /**
   * Live documentation URLs fetched via Jina AI as RAG context for Ollama.
   * Use for fast-moving topics that may be stale in the model's training data.
   */
  sourceUrls?: string[];
  /**
   * Curated further reading links stored in the DB as JSON.
   * These are HIDDEN until the learner passes the topic quiz (≥80%).
   * Reward loop: pass quiz → 🔓 further research unlocks.
   */
  furtherReading?: FurtherReadingLink[];
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
  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 1: THE DIGITAL FOUNDATION
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "The Digital Foundation", slug: "digital-foundation" },
    courses: [
      {
        title: "How Computers Work: Under the Hood",
        description: "A gentle introduction to digital literacy, hardware, and how the internet actually functions.",
        shortDescription: "Understand the machine before you start building on it.",
        difficulty: "BEGINNER",
        duration: 5,
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
            duration: 120,
            topics: [
              {
                title: "Hardware vs Software: The Brain and the Body",
                sourceUrls: ["https://www.bbc.co.uk/bitesize/guides/z7qqmsg/revision/1"],
                furtherReading: [
                  { title: "How Computers Work (Khan Academy)", url: "https://www.khanacademy.org/computing/computer-science/how-computers-work2", description: "Free interactive lessons on how computers process information" },
                  { title: "Computer Hardware Basics (GCFGlobal)", url: "https://edu.gcfglobal.org/en/computerbasics/", description: "Simple, visual guide to computer hardware for absolute beginners" },
                ],
              },
              {
                title: "How the Internet Works: Servers and Clients",
                externalUrl: "https://www.youtube.com/watch?v=7_LPdttKXPc",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works"],
                furtherReading: [
                  { title: "MDN: How the Web Works", url: "https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Web_standards/How_the_web_works", description: "Mozilla's definitive explanation of web architecture" },
                  { title: "Cloudflare: What is the Internet?", url: "https://www.cloudflare.com/learning/network-layer/how-does-the-internet-work/", description: "Clear, visual guide to internet infrastructure" },
                ],
              },
              {
                title: "Project: Draw and Explain Your Internet Journey",
                isProject: true,
              },
            ],
          },
          {
            title: "Module 2: Soft Skills in Tech",
            duration: 120,
            topics: [
              { title: "Effective Communication for Developers" },
              { title: "Computational Thinking: Breaking Big Problems into Small Steps" },
              {
                title: "Project: Solve a Real-Life Problem Using Computational Thinking",
                isProject: true,
              },
            ],
          },
        ],
      },
      {
        title: "AI as a Partner",
        description: "Learn how to use AI as a highly capable intern rather than a magic trick.",
        shortDescription: "Introduction to LLMs and Prompt Engineering.",
        difficulty: "BEGINNER",
        duration: 4,
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
            duration: 60,
            topics: [
              {
                title: "What are Large Language Models?",
                sourceUrls: [
                  "https://en.wikipedia.org/wiki/Large_language_model",
                  "https://www.cloudflare.com/learning/ai/what-is-a-large-language-model/",
                ],
                furtherReading: [
                  { title: "Andrej Karpathy: Intro to LLMs", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g", description: "The clearest explanation of how LLMs work, by one of OpenAI's co-founders" },
                  { title: "Cloudflare: What is an LLM?", url: "https://www.cloudflare.com/learning/ai/what-is-a-large-language-model/", description: "Plain-language breakdown of how language models work" },
                ],
              },
              {
                title: "Hallucinations and Fact-Checking",
                sourceUrls: ["https://en.wikipedia.org/wiki/Hallucination_(artificial_intelligence)"],
              },
              { title: "Project: Catch an AI Hallucination and Fact-Check It", isProject: true },
            ],
          },
          {
            title: "Module 2: Prompt Engineering 101",
            duration: 120,
            topics: [
              {
                title: "The Role + Task + Context Formula",
                sourceUrls: ["https://www.promptingguide.ai/introduction/basics"],
                furtherReading: [
                  { title: "Prompting Guide", url: "https://www.promptingguide.ai/", description: "The most comprehensive free guide to prompt engineering techniques" },
                  { title: "OpenAI Prompt Engineering Guide", url: "https://platform.openai.com/docs/guides/prompt-engineering", description: "Official best practices from OpenAI on writing effective prompts" },
                ],
              },
              { title: "Iterative Prompting for Better Results" },
              { title: "Project: Build a 5-Prompt System to Write Your Professional Bio with AI", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 2: FRONTEND DEVELOPMENT
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "Frontend Development", slug: "frontend-development" },
    courses: [
      // ── HTML BEGINNER ──────────────────────────────────────────────────────
      {
        title: "HTML Foundations: The Bones of the Web",
        description: "Learn the core structure of the web by building your first web pages from scratch. Covers semantic HTML, forms, accessibility basics, and deploying to GitHub Pages.",
        shortDescription: "Master HTML semantics, accessibility, and publishing your first web page.",
        difficulty: "BEGINNER",
        duration: 8,
        price: 0,
        tags: ["html", "web", "semantics", "accessibility", "beginner"],
        learningOutcomes: [
          "Build a complete HTML page using semantic elements",
          "Create accessible forms that collect user data",
          "Explain the DOM and how browsers parse HTML",
          "Deploy a web page live to GitHub Pages",
        ],
        modules: [
          {
            title: "Module 1: Getting Started",
            duration: 120,
            topics: [
              {
                title: "What is HTML and the DOM?",
                externalUrl: "https://www.freecodecamp.org/learn/2022/responsive-web-design/",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction"],
                furtherReading: [
                  { title: "MDN: Introduction to HTML", url: "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML", description: "The complete HTML reference — bookmark this for life" },
                  { title: "web.dev: Learn HTML", url: "https://web.dev/learn/html", description: "Google's structured HTML learning path" },
                ],
              },
              {
                title: "Basic Tags and Nesting",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax"],
              },
              { title: "Images, Links, and the Anchor Tag" },
              { title: "Setting Up VS Code for Web Development" },
            ],
          },
          {
            title: "Module 2: Structure, Semantics & Accessibility",
            duration: 180,
            topics: [
              {
                title: "Semantic HTML: Header, Main, Footer, Article",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Glossary/Semantics"],
                furtherReading: [
                  { title: "MDN: HTML elements reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element", description: "Every HTML element explained with examples" },
                  { title: "web.dev: Semantic HTML", url: "https://web.dev/learn/html/semantic-html", description: "Why semantics matter for SEO and accessibility" },
                  { title: "A11y Project Checklist", url: "https://www.a11yproject.com/checklist/", description: "The accessibility checklist every developer needs" },
                ],
              },
              {
                title: "Building Forms to Collect Data",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form"],
              },
              { title: "Accessibility Basics: alt, aria-label, and Tab Order" },
              { title: "Project: Build a Personal Profile Page", isProject: true },
            ],
          },
          {
            title: "Module 3: Going Live",
            duration: 120,
            topics: [
              { title: "Meta Tags, Favicon, and Page Title Best Practices" },
              { title: "Uploading to GitHub Pages for Free",
                furtherReading: [
                  { title: "GitHub Pages Documentation", url: "https://docs.github.com/en/pages/getting-started-with-github-pages", description: "Official step-by-step guide to deploying with GitHub Pages" },
                ],
              },
              { title: "Project: Publish Your Profile Page Online", isProject: true, externalUrl: "https://pages.github.com/" },
            ],
          },
        ],
      },

      // ── HTML INTERMEDIATE ──────────────────────────────────────────────────
      {
        title: "HTML Intermediate: Semantic Architecture & Forms Mastery",
        description: "Go beyond basic tags. Learn semantic page design, advanced forms with client-side validation, SEO metadata, and OpenGraph for social sharing.",
        shortDescription: "Build pages that search engines and screen readers understand perfectly.",
        difficulty: "INTERMEDIATE",
        duration: 8,
        price: 0,
        tags: ["html", "semantics", "forms", "SEO", "accessibility", "intermediate"],
        learningOutcomes: [
          "Architect a semantic HTML document that scores 100 on Lighthouse accessibility",
          "Build multi-field forms with native HTML5 constraint validation",
          "Add OpenGraph and Twitter Card meta tags for rich social sharing",
          "Correctly implement ARIA roles for dynamic content",
        ],
        modules: [
          {
            title: "Module 1: The Semantic Blueprint",
            duration: 150,
            topics: [
              {
                title: "Semantic Landmark Roles: article, aside, section, nav",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element"],
                furtherReading: [
                  { title: "MDN: HTML elements reference", url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element", description: "Every HTML element explained with examples" },
                ],
              },
              {
                title: "ARIA Roles and Screen Reader Compatibility",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA"],
              },
              { title: "HTML Outlines and Heading Hierarchy for SEO" },
              { title: "Project: Redesign a Non-Semantic Page to Fully Semantic", isProject: true },
            ],
          },
          {
            title: "Module 2: Forms That Actually Work",
            duration: 180,
            topics: [
              {
                title: "Advanced Input Types: date, color, range, file, datalist",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input"],
              },
              {
                title: "Native HTML5 Constraint Validation: required, pattern, minlength",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation"],
                furtherReading: [
                  { title: "MDN: Client-side form validation", url: "https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation", description: "Complete guide to native HTML5 validation" },
                ],
              },
              { title: "Fieldset, Legend, and Multi-step Form Structure" },
              { title: "Project: Build a Multi-Step Job Application Form", isProject: true },
            ],
          },
          {
            title: "Module 3: HTML for Discoverability",
            duration: 150,
            topics: [
              {
                title: "Meta Tags for SEO: description, robots, canonical",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML/The_head_metadata_in_HTML"],
              },
              { title: "OpenGraph & Twitter Cards for Social Sharing" },
              { title: "Structured Data with JSON-LD (Schema.org)" },
              { title: "Project: Add Full SEO + Social Metadata to a Product Page", isProject: true },
            ],
          },
        ],
      },

      // ── HTML ADVANCED ──────────────────────────────────────────────────────
      {
        title: "HTML Advanced: Components, Performance & the Platform",
        description: "Master the web platform at its deepest level. Custom Elements, Shadow DOM, performance-critical HTML patterns, and native browser APIs.",
        shortDescription: "Write HTML that performs, scales, and leverages the full web platform.",
        difficulty: "ADVANCED",
        duration: 10,
        price: 0,
        tags: ["html", "web-components", "shadow-dom", "performance", "advanced"],
        learningOutcomes: [
          "Build fully encapsulated UI components using Web Components APIs",
          "Implement performant HTML patterns: lazy loading, preload, prefetch",
          "Use template, slot, and custom elements to build a reusable widget library",
          "Audit and remediate Core Web Vitals issues in a live HTML page",
        ],
        modules: [
          {
            title: "Module 1: Web Components",
            duration: 200,
            topics: [
              {
                title: "Custom Elements: Defining Your Own HTML Tags",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements"],
                furtherReading: [
                  { title: "MDN: Web Components", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_components", description: "The complete Web Components API reference" },
                  { title: "web.dev: Custom Elements", url: "https://web.dev/articles/custom-elements-v1", description: "Google's deep dive into Custom Elements v1" },
                ],
              },
              {
                title: "Shadow DOM: Encapsulated Styles and Markup",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM"],
              },
              { title: "HTML Templates and Slots" },
              { title: "Project: Build a Reusable <star-rating> Web Component", isProject: true, externalUrl: "https://developer.mozilla.org/en-US/docs/Web/API/Web_components" },
            ],
          },
          {
            title: "Module 2: Performance-Critical HTML",
            duration: 180,
            topics: [
              {
                title: "Resource Hints: preload, prefetch, preconnect",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preload"],
                furtherReading: [
                  { title: "web.dev: Resource Hints", url: "https://web.dev/learn/performance/resource-hints", description: "How preload, prefetch, and preconnect affect loading performance" },
                ],
              },
              { title: "Lazy Loading Images and Iframes Natively" },
              { title: "Critical Rendering Path Optimization" },
              { title: "Project: Audit a Slow HTML Page to 90+ Lighthouse Score", isProject: true },
            ],
          },
          {
            title: "Module 3: The Full Platform",
            duration: 180,
            topics: [
              { title: "The <dialog> Element for Native Modals" },
              { title: "Popover API and Anchor Positioning" },
              { title: "Native HTML Form Validation vs JavaScript: When to Use Which" },
              { title: "Project: Build a Pure-HTML Component Library (No CSS Framework)", isProject: true },
            ],
          },
        ],
      },

      // ── CSS MASTERY ────────────────────────────────────────────────────────
      {
        title: "CSS Mastery: The Skin of the Web",
        description: "Style your foundational HTML with colors, layouts, and typography. Build responsive, beautiful UIs that work on every screen.",
        shortDescription: "Learn Flexbox, Grid, and the Cascade.",
        difficulty: "BEGINNER",
        duration: 10,
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
            duration: 120,
            topics: [
              {
                title: "The Box Model",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model"],
                furtherReading: [
                  { title: "CSS-Tricks: The CSS Box Model", url: "https://css-tricks.com/the-css-box-model/", description: "Visual, interactive explanation of margin, border, padding, content" },
                ],
              },
              {
                title: "Understanding the Cascade and Specificity",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/CSS/Specificity"],
              },
              { title: "Colors, Typography, and Google Fonts" },
              {
                title: "Project: Build a Styled Personal Bio Card",
                isProject: true,
                externalUrl: "https://coolors.co",
                furtherReading: [
                  { title: "Coolors — Color Palette Generator", url: "https://coolors.co/", description: "Generate beautiful color palettes for your projects" },
                  { title: "Google Fonts", url: "https://fonts.google.com/", description: "Free, professional fonts for any web project" },
                ],
              },
            ],
          },
          {
            title: "Module 2: Modern Layouts",
            duration: 200,
            topics: [
              {
                title: "Flexbox Fundamentals",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Flexbox"],
                furtherReading: [
                  { title: "CSS-Tricks: Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", description: "The most referenced Flexbox cheat sheet on the internet" },
                  { title: "Flexbox Froggy", url: "https://flexboxfroggy.com/", description: "Learn Flexbox by playing a game — genuinely fun" },
                ],
              },
              {
                title: "CSS Grid for Advanced Layouts",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Grids"],
                furtherReading: [
                  { title: "CSS-Tricks: Complete Guide to Grid", url: "https://css-tricks.com/snippets/css/complete-guide-grid/", description: "The definitive CSS Grid reference" },
                  { title: "Grid Garden", url: "https://cssgridgarden.com/", description: "Learn CSS Grid by watering plants in a game" },
                ],
              },
              {
                title: "Responsive Design and Media Queries",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design"],
              },
              {
                title: "Project: Build a Responsive Magazine-Style Layout",
                isProject: true,
                externalUrl: "https://cssgrid.io",
              },
            ],
          },
        ],
      },

      // ── VANILLA JAVASCRIPT ─────────────────────────────────────────────────
      {
        title: "Vanilla JavaScript: The Engine",
        description: "Add interactivity to your static pages with pure JavaScript. No frameworks — just the real language.",
        shortDescription: "Logic, events, and true programming.",
        difficulty: "INTERMEDIATE",
        duration: 15,
        price: 0,
        tags: ["javascript", "DOM", "events", "intermediate"],
        learningOutcomes: [
          "Write functions and control flow using core JS syntax",
          "Manipulate the DOM to update pages dynamically",
          "Handle user interactions with event listeners",
          "Fetch data from APIs using async/await",
        ],
        modules: [
          {
            title: "Module 1: Core Logic",
            duration: 180,
            topics: [
              {
                title: "Variables and Data Types",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types"],
                furtherReading: [
                  { title: "javascript.info: The Modern JS Tutorial", url: "https://javascript.info/", description: "The best free JavaScript book on the internet — comprehensive and clear" },
                  { title: "MDN: JavaScript Guide", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", description: "Official and authoritative JavaScript reference" },
                ],
              },
              {
                title: "Functions and Scope",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions"],
              },
              {
                title: "If/Else Statements and Loops",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling"],
              },
              {
                title: "Project: Build a Live Word & Character Counter",
                isProject: true,
              },
            ],
          },
          {
            title: "Module 2: The Browser Interface",
            duration: 200,
            topics: [
              {
                title: "Manipulating the DOM",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting"],
              },
              {
                title: "Listening for Events (Clicks, Inputs)",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events"],
              },
              {
                title: "Fetch API and Async/Await",
                sourceUrls: ["https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch"],
                furtherReading: [
                  { title: "javascript.info: Promises & async/await", url: "https://javascript.info/async", description: "The clearest explanation of async JavaScript anywhere" },
                  { title: "MDN: Using Fetch", url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch", description: "Official Fetch API documentation with live examples" },
                ],
              },
              {
                title: "Project: Build a DOM-Powered Kanban Board",
                isProject: true,
              },
            ],
          },
        ],
      },

      // ── REACT FUNDAMENTALS ─────────────────────────────────────────────────
      {
        title: "React Fundamentals",
        description: "Move from manual DOM updates to modern component-based architecture. Learn React the right way, starting with the mental model.",
        shortDescription: "The industry standard for UIs.",
        difficulty: "INTERMEDIATE",
        duration: 12,
        price: 0,
        tags: ["react", "components", "hooks", "jsx", "intermediate"],
        learningOutcomes: [
          "Build reusable React components using JSX",
          "Manage dynamic UI state with useState and useEffect",
          "Understand React 19's Server Components model",
          "Fetch and display live data in a React app",
        ],
        modules: [
          {
            title: "Module 1: The React Mental Model",
            duration: 150,
            topics: [
              {
                title: "What are Components?",
                sourceUrls: ["https://react.dev/learn/your-first-component"],
                furtherReading: [
                  { title: "react.dev: Quick Start", url: "https://react.dev/learn", description: "The official, interactive React tutorial — start here" },
                ],
              },
              {
                title: "JSX: Combining HTML and JS",
                sourceUrls: ["https://react.dev/learn/writing-markup-with-jsx"],
              },
              { title: "Props: Passing Data to Components" },
              {
                title: "Project: Build a Profile Card Component with Props",
                isProject: true,
              },
            ],
          },
          {
            title: "Module 2: Managing Change",
            duration: 180,
            topics: [
              {
                title: "State Updates with useState",
                sourceUrls: ["https://react.dev/reference/react/useState"],
                furtherReading: [
                  { title: "react.dev: State: A Component's Memory", url: "https://react.dev/learn/state-a-components-memory", description: "React's official, interactive tutorial on state" },
                  { title: "Dan Abramov: A Complete Guide to useEffect", url: "https://overreacted.io/a-complete-guide-to-useeffect/", description: "The most thorough useEffect explanation ever written" },
                ],
              },
              {
                title: "Side Effects with useEffect",
                sourceUrls: ["https://react.dev/reference/react/useEffect"],
              },
              {
                title: "React 19: Server Components",
                sourceUrls: ["https://react.dev/reference/rsc/server-components"],
              },
              {
                title: "Project: Build a Pomodoro Timer with State Management",
                isProject: true,
              },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 3: TYPESCRIPT MASTERY
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "TypeScript Mastery", slug: "typescript-mastery" },
    courses: [
      {
        title: "TypeScript Foundations",
        description: "Learn TypeScript from zero — type safety, interfaces, and the compiler — and understand why Fortune 500 teams won't hire without it.",
        shortDescription: "Add types to JavaScript and write bulletproof code.",
        difficulty: "BEGINNER",
        duration: 8,
        price: 0,
        tags: ["typescript", "types", "interfaces", "beginner"],
        learningOutcomes: [
          "Migrate a JavaScript file to strict TypeScript with zero type errors",
          "Define interfaces, enums, and type aliases for complex data",
          "Use generics to write reusable, type-safe functions",
        ],
        modules: [
          {
            title: "Module 1: Why TypeScript & the Type System",
            duration: 150,
            topics: [
              {
                title: "Why TypeScript? The Case for Type Safety",
                sourceUrls: ["https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html"],
                furtherReading: [
                  { title: "TypeScript Official Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", description: "The complete TypeScript reference from Microsoft" },
                  { title: "Total TypeScript by Matt Pocock", url: "https://www.totaltypescript.com/tutorials", description: "Free interactive TS tutorials from the world's most respected TS educator" },
                ],
              },
              { title: "Primitive Types, Arrays, and Tuples" },
              { title: "tsconfig.json: Setting Up Your TypeScript Project" },
              { title: "Project: Migrate a 100-Line JS File to Strict TypeScript", isProject: true },
            ],
          },
          {
            title: "Module 2: Interfaces, Enums & Type Aliases",
            duration: 150,
            topics: [
              { title: "Interfaces vs Type Aliases: When to Use Each" },
              { title: "Enums and Literal Types" },
              { title: "Union and Intersection Types" },
              { title: "Project: Build a Type-Safe Contact Book", isProject: true },
            ],
          },
          {
            title: "Module 3: Functions & Generics",
            duration: 150,
            topics: [
              { title: "Typed Functions: Parameters, Return Types, and Overloads" },
              {
                title: "Introduction to Generics",
                furtherReading: [
                  { title: "type-challenges on GitHub", url: "https://github.com/type-challenges/type-challenges", description: "Practice TypeScript type puzzles at beginner through extreme difficulty" },
                ],
              },
              { title: "Project: Build a Typed Utility Function Library", isProject: true },
            ],
          },
        ],
      },
      {
        title: "TypeScript Intermediate: TypeScript for Teams",
        description: "Master advanced generics, utility types, and TypeScript with React. Write code your whole team can understand and maintain.",
        shortDescription: "Generics, utility types, and TypeScript+React.",
        difficulty: "INTERMEDIATE",
        duration: 10,
        price: 0,
        tags: ["typescript", "generics", "react", "zod", "intermediate"],
        learningOutcomes: [
          "Write advanced generic functions using TypeScript utility types",
          "Build a fully typed React form with Zod validation",
          "Extend third-party library types using declaration merging",
        ],
        modules: [
          {
            title: "Module 1: Advanced Generics & Utility Types",
            duration: 180,
            topics: [
              { title: "Partial, Required, Readonly, Pick, Omit — Mastering Utility Types" },
              { title: "Conditional Types and infer" },
              { title: "Mapped Types and Template Literal Types" },
              { title: "Project: Build a Typed API Response Transformer", isProject: true },
            ],
          },
          {
            title: "Module 2: TypeScript with React",
            duration: 180,
            topics: [
              { title: "Typing Props, State, and Events in React" },
              { title: "Generic React Components" },
              {
                title: "Runtime Validation with Zod",
                sourceUrls: ["https://zod.dev/"],
                furtherReading: [
                  { title: "Zod Documentation", url: "https://zod.dev/", description: "The most popular TypeScript-first schema validation library" },
                ],
              },
              { title: "Project: Build a Fully Typed React Form with Zod Validation", isProject: true },
            ],
          },
          {
            title: "Module 3: Declaration Files & Module Augmentation",
            duration: 150,
            topics: [
              { title: "Writing .d.ts Declaration Files" },
              { title: "Module Augmentation: Extending Third-Party Types" },
              { title: "Strict Mode and Compiler Options Deep Dive" },
              { title: "Project: Extend Express's Request Type with Custom Properties", isProject: true },
            ],
          },
        ],
      },
      {
        title: "TypeScript Advanced: TypeScript Engineering",
        description: "Push TypeScript to its limits — compiler APIs, monorepos, and automated type generation from OpenAPI specs.",
        shortDescription: "Compiler API, monorepos, and TypeScript tooling.",
        difficulty: "ADVANCED",
        duration: 12,
        price: 0,
        tags: ["typescript", "compiler", "monorepo", "codegen", "advanced"],
        learningOutcomes: [
          "Use conditional types to build a type-level data validator",
          "Set up a monorepo with shared TypeScript types across packages",
          "Auto-generate TypeScript types from an OpenAPI specification",
        ],
        modules: [
          {
            title: "Module 1: Compiler API & Conditional Types",
            duration: 200,
            topics: [
              { title: "Recursive Types and Deep Partial" },
              { title: "Template Literal Types for API Route Safety" },
              { title: "Introduction to the TypeScript Compiler API" },
              { title: "Project: Build a Type-Level Data Validator", isProject: true },
            ],
          },
          {
            title: "Module 2: Monorepo Setup & Shared Types",
            duration: 180,
            topics: [
              { title: "Monorepos with npm Workspaces or Turborepo" },
              { title: "Sharing Types Between Frontend and Backend" },
              { title: "Publishing a TypeScript Package to npm" },
              { title: "Project: Build a Shared Types Package Used by Both Frontend and API", isProject: true },
            ],
          },
          {
            title: "Module 3: Codegen & Tooling",
            duration: 150,
            topics: [
              { title: "Generating Types from Prisma Schema" },
              {
                title: "Generating TypeScript from OpenAPI Specs",
                furtherReading: [
                  { title: "openapi-typescript", url: "https://openapi-ts.pages.dev/", description: "Generate TypeScript types from any OpenAPI 3.x specification" },
                ],
              },
              { title: "ESLint with TypeScript: typescript-eslint" },
              { title: "Project: Generate a Complete Typed API Client from an OpenAPI Spec", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 4: PYTHON DEVELOPMENT
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "Python Development", slug: "python-development" },
    courses: [
      {
        title: "Python for Problem Solvers",
        description: "Start from zero in Python — variables, functions, files, and automation — with a project that ships real value by the end of 3 weeks.",
        shortDescription: "Python from zero to automating your first task.",
        difficulty: "BEGINNER",
        duration: 8,
        price: 0,
        tags: ["python", "beginner", "automation", "scripting"],
        learningOutcomes: [
          "Write Python scripts to solve real-world problems",
          "Automate repetitive file management tasks",
          "Use lists, dicts, and functions effectively",
        ],
        modules: [
          {
            title: "Module 1: Syntax & Control Flow",
            duration: 150,
            topics: [
              {
                title: "Variables, Data Types, and Print Statements",
                sourceUrls: ["https://docs.python.org/3/tutorial/introduction.html"],
                furtherReading: [
                  { title: "Python Official Tutorial", url: "https://docs.python.org/3/tutorial/index.html", description: "The official Python docs — still the best starting point" },
                  { title: "Real Python Tutorials", url: "https://realpython.com/", description: "Practical Python tutorials with real-world context" },
                ],
              },
              { title: "If/Else, For Loops, and While Loops" },
              { title: "User Input and Basic String Manipulation" },
              { title: "Project: Build a CLI Number Guessing Game", isProject: true },
            ],
          },
          {
            title: "Module 2: Functions, Lists & Dicts",
            duration: 160,
            topics: [
              { title: "Defining and Calling Functions" },
              { title: "Lists, Tuples, and Slicing" },
              { title: "Dictionaries and Sets" },
              { title: "Project: Build a Contact Book Saved to a .txt File", isProject: true },
            ],
          },
          {
            title: "Module 3: File I/O & Automation",
            duration: 150,
            topics: [
              { title: "Reading and Writing Files" },
              { title: "The os Module: Navigating Your File System" },
              { title: "Error Handling with Try/Except" },
              { title: "Project: Build a File Organizer Script (sorts downloads folder by type)", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Python for Builders",
        description: "Level up with OOP, APIs, web scraping, and building your first REST service with FastAPI.",
        shortDescription: "OOP, APIs, scraping, and REST services with FastAPI.",
        difficulty: "INTERMEDIATE",
        duration: 12,
        price: 0,
        tags: ["python", "oop", "fastapi", "scraping", "intermediate"],
        learningOutcomes: [
          "Design Python programs using object-oriented principles",
          "Scrape live data from websites using BeautifulSoup",
          "Build a full CRUD REST API with FastAPI and authentication",
        ],
        modules: [
          {
            title: "Module 1: OOP, Decorators & Error Handling",
            duration: 180,
            topics: [
              { title: "Classes, Objects, and Inheritance" },
              { title: "Decorators and the @property Pattern" },
              { title: "Advanced Error Handling and Custom Exceptions" },
              { title: "Project: Build a Student Grade Manager Using OOP", isProject: true },
            ],
          },
          {
            title: "Module 2: APIs & Web Scraping",
            duration: 180,
            topics: [
              {
                title: "Consuming REST APIs with the requests Library",
                furtherReading: [
                  { title: "Requests Library Documentation", url: "https://docs.python-requests.org/en/latest/", description: "The HTTP library for Python — simple, elegant, powerful" },
                ],
              },
              { title: "Web Scraping with BeautifulSoup and Selenium" },
              { title: "Rate Limiting and Ethical Scraping" },
              { title: "Project: Build a News Headline Scraper That Emails You Daily", isProject: true },
            ],
          },
          {
            title: "Module 3: FastAPI REST Services",
            duration: 200,
            topics: [
              {
                title: "FastAPI: REST APIs in Python at Record Speed",
                sourceUrls: ["https://fastapi.tiangolo.com/tutorial/"],
                furtherReading: [
                  { title: "FastAPI Documentation", url: "https://fastapi.tiangolo.com/", description: "The most developer-friendly Python API framework" },
                ],
              },
              { title: "Database Integration with SQLAlchemy and SQLite" },
              { title: "JWT Authentication in FastAPI" },
              { title: "Project: Build a Full CRUD REST API with Auth and Deploy to Railway", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Python for AI & Automation",
        description: "Use Python to work with OpenAI's API, analyse data with Pandas, and build a RAG PDF chatbot with LangChain.",
        shortDescription: "OpenAI API, Pandas, and RAG chatbots.",
        difficulty: "ADVANCED",
        duration: 14,
        price: 0,
        tags: ["python", "openai", "pandas", "langchain", "RAG", "advanced"],
        learningOutcomes: [
          "Call the OpenAI API with custom system prompts and parse structured responses",
          "Analyse and visualise a real dataset using Pandas and Matplotlib",
          "Build a working PDF Q&A chatbot using LangChain and FAISS",
        ],
        modules: [
          {
            title: "Module 1: OpenAI API & Prompt Engineering in Python",
            duration: 180,
            topics: [
              {
                title: "Calling the OpenAI API from Python",
                sourceUrls: ["https://platform.openai.com/docs/api-reference/chat"],
                furtherReading: [
                  { title: "OpenAI Python Library", url: "https://github.com/openai/openai-python", description: "Official OpenAI Python SDK with full examples" },
                ],
              },
              { title: "Structured Outputs: Parsing JSON from LLM Responses" },
              { title: "System Prompts, Temperature, and Token Management" },
              { title: "Project: Build an AI Document Summarizer CLI Tool", isProject: true },
            ],
          },
          {
            title: "Module 2: Pandas + Data Analysis",
            duration: 180,
            topics: [
              {
                title: "DataFrames, Series, and Reading CSVs with Pandas",
                furtherReading: [
                  { title: "Pandas Documentation", url: "https://pandas.pydata.org/docs/user_guide/index.html", description: "Complete Pandas user guide — filtering, grouping, aggregation" },
                ],
              },
              { title: "Cleaning Messy Data: fillna, dropna, rename, apply" },
              { title: "Visualising Data with Matplotlib and Seaborn" },
              { title: "Project: Build an Automated Weekly Expense Report from a CSV File", isProject: true },
            ],
          },
          {
            title: "Module 3: RAG & LangChain",
            duration: 200,
            topics: [
              {
                title: "What is RAG? Retrieval Augmented Generation Explained",
                sourceUrls: ["https://python.langchain.com/docs/tutorials/rag/"],
                furtherReading: [
                  { title: "LangChain Documentation", url: "https://python.langchain.com/docs/introduction/", description: "The main framework for building LLM-powered apps in Python" },
                ],
              },
              { title: "Vector Stores and Embeddings with FAISS" },
              { title: "Building a LangChain Pipeline: Load → Split → Embed → Retrieve → Generate" },
              { title: "Project: Build a PDF Q&A Chatbot (ask any question about any PDF)", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 5: AI FOR EVERYDAY TASKS
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "AI for Everyday Tasks", slug: "ai-everyday-tasks" },
    courses: [
      {
        title: "AI as Your Personal Assistant",
        description: "Learn to use AI tools to write better, research faster, and produce professional-quality output in a fraction of the time.",
        shortDescription: "ChatGPT, Gemini, Claude — tools that make you 10× faster.",
        difficulty: "BEGINNER",
        duration: 5,
        price: 0,
        tags: ["AI", "ChatGPT", "productivity", "writing", "beginner"],
        learningOutcomes: [
          "Rewrite a professional CV using AI prompts",
          "Research any topic deeply using AI as a research partner",
          "Produce a full business proposal using AI collaboration",
        ],
        modules: [
          {
            title: "Module 1: Understanding AI Tools",
            duration: 90,
            topics: [
              { title: "ChatGPT vs Gemini vs Claude: Which Tool for Which Task?" },
              { title: "How to Think in Prompts: The ROLE + TASK + FORMAT Method" },
              { title: "Project: Rewrite Your CV Using AI Only — Then Improve It", isProject: true },
            ],
          },
          {
            title: "Module 2: Prompting for Writing",
            duration: 120,
            topics: [
              { title: "AI for Professional Emails, Reports, and Proposals" },
              { title: "Tone and Voice: Getting AI to Sound Like You" },
              { title: "Project: Write a Full Business Proposal Using AI Collaboration", isProject: true },
            ],
          },
          {
            title: "Module 3: AI for Research & Summarization",
            duration: 120,
            topics: [
              {
                title: "Deep Research with Perplexity AI and ChatGPT",
                furtherReading: [
                  { title: "Perplexity AI", url: "https://www.perplexity.ai/", description: "AI-powered search with cited sources — the researcher's best friend" },
                ],
              },
              { title: "Summarizing Long Documents and Reports" },
              { title: "Project: Summarize 3 Industry Reports Into a Sharp 1-Page Brief", isProject: true },
            ],
          },
        ],
      },
      {
        title: "AI Workflows & Productivity",
        description: "Build multi-step AI workflows, create custom GPTs, and integrate AI into your existing tools like Notion and Google Workspace.",
        shortDescription: "Build custom GPTs and automate your workflows.",
        difficulty: "INTERMEDIATE",
        duration: 8,
        price: 0,
        tags: ["AI", "workflows", "GPTs", "automation", "intermediate"],
        learningOutcomes: [
          "Build a complete content repurposing workflow with AI",
          "Create a Custom GPT configured for your specific business needs",
          "Automate a meeting note-to-action workflow with AI",
        ],
        modules: [
          {
            title: "Module 1: Chaining Prompts & Multi-step Workflows",
            duration: 150,
            topics: [
              { title: "Prompt Chaining: Feeding One AI Output into the Next" },
              { title: "Building a Content Repurposing System" },
              { title: "Project: Build a Complete Content Repurposing Workflow (1 article → 6 formats)", isProject: true },
            ],
          },
          {
            title: "Module 2: Custom GPTs & Instructions",
            duration: 150,
            topics: [
              {
                title: "Building a Custom GPT: Instructions, Knowledge, and Actions",
                furtherReading: [
                  { title: "OpenAI GPT Builder Guide", url: "https://help.openai.com/en/articles/8770868-gpt-builder", description: "Official guide to building and publishing Custom GPTs" },
                ],
              },
              { title: "Giving Your GPT a Persona, Guardrails, and Custom Data" },
              { title: "Project: Build a Custom GPT for Your Business or Niche", isProject: true },
            ],
          },
          {
            title: "Module 3: AI + Productivity Tools",
            duration: 150,
            topics: [
              { title: "AI in Google Workspace: Gemini for Docs, Sheets, and Slides" },
              { title: "Notion AI and Other Note-Taking AI Integrations" },
              { title: "Project: Build an Automated Meeting Note → Action Items → Notion Page Workflow", isProject: true },
            ],
          },
        ],
      },
      {
        title: "AI Power User",
        description: "Go deep: no-code automation with Make.com, direct API access to OpenAI, and running local AI models with Ollama for complete privacy.",
        shortDescription: "Make.com automation, OpenAI API, and local LLMs.",
        difficulty: "ADVANCED",
        duration: 12,
        price: 0,
        tags: ["AI", "automation", "OpenAI", "Ollama", "API", "advanced"],
        learningOutcomes: [
          "Build a multi-step automation pipeline in Make.com",
          "Access OpenAI and Anthropic APIs directly without code",
          "Run AI models locally on your laptop with zero data sent to the cloud",
        ],
        modules: [
          {
            title: "Module 1: No-Code AI Automation (Make.com & Zapier)",
            duration: 180,
            topics: [
              {
                title: "Make.com vs Zapier: Which is Right for Your Workflow?",
                furtherReading: [
                  { title: "Make.com Documentation", url: "https://www.make.com/en/help", description: "Official Make.com automation documentation" },
                ],
              },
              { title: "Building Multi-Step Automations with AI Steps" },
              { title: "Project: Build an Automated Email Responder That Uses AI to Draft Replies", isProject: true },
            ],
          },
          {
            title: "Module 2: Direct API Access (OpenAI & Claude)",
            duration: 180,
            topics: [
              {
                title: "Using the OpenAI API with No-Code Tools",
                furtherReading: [
                  { title: "OpenAI API Reference", url: "https://platform.openai.com/docs/api-reference", description: "Complete OpenAI API documentation" },
                  { title: "Anthropic Claude API Docs", url: "https://docs.anthropic.com/en/api/getting-started", description: "Claude API documentation from Anthropic" },
                ],
              },
              { title: "Document Q&A Without Writing Code" },
              { title: "Project: Build a Document Q&A Tool Using Zapier + OpenAI API", isProject: true },
            ],
          },
          {
            title: "Module 3: Local LLMs with Ollama",
            duration: 180,
            topics: [
              {
                title: "Running LLaMA 3 Locally with Ollama",
                sourceUrls: ["https://ollama.com/"],
                furtherReading: [
                  { title: "Ollama Library", url: "https://ollama.com/library", description: "All models available to run locally — LLaMA, Mistral, Gemma, and more" },
                ],
              },
              { title: "Private AI: Analysing Sensitive Data That Never Leaves Your Machine" },
              { title: "Project: Build a Private Local AI Assistant for Business Documents", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 6: AI FOR CONTENT CREATION ⭐ STAR COURSE
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "AI for Content Creation", slug: "ai-content-creation" },
    courses: [
      {
        title: "Create Content 10x Faster with AI",
        description: "Use AI to script, design, narrate, and produce content for YouTube, Instagram, TikTok, and podcasts — without a studio or team.",
        shortDescription: "AI scripts, AI images, AI voiceover — all yours.",
        difficulty: "BEGINNER",
        duration: 6,
        price: 0,
        tags: ["AI", "content", "YouTube", "podcast", "images", "beginner"],
        learningOutcomes: [
          "Script a 5-video YouTube series using only AI tools",
          "Generate 10 branded thumbnails with Midjourney or Ideogram",
          "Produce a 3-minute podcast episode using AI voiceover",
        ],
        modules: [
          {
            title: "Module 1: AI Scripts & Captions",
            duration: 120,
            topics: [
              { title: "Writing Video Scripts with ChatGPT: Hook, Value, CTA Formula" },
              {
                title: "Generating Captions with Whisper and Kapwing",
                furtherReading: [
                  { title: "Kapwing AI Video Editor", url: "https://www.kapwing.com/", description: "Free AI-powered video captioning and editing tool" },
                ],
              },
              { title: "Project: AI-Scripted 5-Video YouTube Series Outline", isProject: true },
            ],
          },
          {
            title: "Module 2: AI Image Generation for Creators",
            duration: 120,
            topics: [
              {
                title: "Midjourney, Ideogram, and Leonardo.ai for Thumbnails",
                furtherReading: [
                  { title: "Ideogram AI", url: "https://ideogram.ai/", description: "AI image generator with exceptional text rendering — great for thumbnails" },
                  { title: "Leonardo.ai", url: "https://leonardo.ai/", description: "AI image and video generation platform with a generous free tier" },
                ],
              },
              { title: "Brand Consistency: Using the Same Character Across AI Images" },
              { title: "Project: Generate 10 Branded Thumbnails for a YouTube Channel", isProject: true },
            ],
          },
          {
            title: "Module 3: AI Voiceover & Podcast Production",
            duration: 120,
            topics: [
              {
                title: "ElevenLabs and PlayHT: Realistic AI Voiceovers",
                furtherReading: [
                  { title: "ElevenLabs", url: "https://elevenlabs.io/", description: "The most realistic AI voice generation platform available" },
                ],
              },
              { title: "Assembling a Podcast Episode: AI Script → AI Voice → Descript Edit" },
              { title: "Project: Produce a 3-Minute AI Podcast Episode End-to-End", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Your AI Content Studio",
        description: "Level up: AI video generation, content repurposing systems, and SEO-optimised YouTube channel management — all powered by AI.",
        shortDescription: "AI video, repurposing engines, and YouTube SEO.",
        difficulty: "INTERMEDIATE",
        duration: 10,
        price: 0,
        tags: ["AI", "Runway", "video", "SEO", "repurposing", "intermediate"],
        learningOutcomes: [
          "Generate a 60-second AI product video using Runway or Kling",
          "Build a system that transforms 1 piece of content into 10 platforms",
          "Fully optimise a YouTube channel with AI-generated titles and descriptions",
        ],
        modules: [
          {
            title: "Module 1: AI Video Generation",
            duration: 200,
            topics: [
              {
                title: "Runway Gen-3, Kling, and HeyGen: Comparing AI Video Tools",
                furtherReading: [
                  { title: "Runway Research", url: "https://runwayml.com/", description: "Industry-leading AI video generation platform" },
                  { title: "HeyGen AI Avatar Videos", url: "https://www.heygen.com/", description: "Create AI presenter videos from text in minutes" },
                ],
              },
              { title: "Text-to-Video: Writing Prompts That Generate Compelling Footage" },
              { title: "Project: Create a 60-Second AI-Generated Product Promo Video", isProject: true },
            ],
          },
          {
            title: "Module 2: Content Repurposing Systems",
            duration: 180,
            topics: [
              { title: "The Content Pyramid: 1 Long-Form → 10 Short-Form Pieces" },
              { title: "Platform-Native Content: Instagram vs LinkedIn vs TikTok vs X" },
              { title: "Project: Turn 1 Blog Post into 10 Pieces of Platform-Native Content", isProject: true },
            ],
          },
          {
            title: "Module 3: AI SEO for Content Creators",
            duration: 180,
            topics: [
              { title: "AI-Generated Titles, Descriptions, and Tags That Rank" },
              { title: "Thumbnail A/B Testing with AI" },
              { title: "Project: Fully Optimise a 10-Video YouTube Channel with AI Tools", isProject: true },
            ],
          },
        ],
      },
      {
        title: "AI Content Agency Blueprint",
        description: "Build a scalable AI content production business: automated pipelines, brand voice systems, and a professional pitch deck to land clients.",
        shortDescription: "Build and sell an AI content service business.",
        difficulty: "ADVANCED",
        duration: 12,
        price: 0,
        tags: ["AI", "agency", "automation", "brand-voice", "monetization", "advanced"],
        learningOutcomes: [
          "Design a fully automated 30-day content calendar system",
          "Build a brand voice guide and prompt library for any client",
          "Create a pitch deck and pricing structure for an AI content agency",
        ],
        modules: [
          {
            title: "Module 1: Scalable Content Pipelines",
            duration: 200,
            topics: [
              { title: "Mapping Your Full Content Production Pipeline" },
              { title: "Automating Publishing with Make.com + Buffer + AI" },
              { title: "Project: Build an Automated 30-Day Content Calendar System", isProject: true },
            ],
          },
          {
            title: "Module 2: AI Brand Voice & Consistency",
            duration: 180,
            topics: [
              { title: "Extracting a Brand Voice: From Interviews to Prompt Instructions" },
              { title: "Building a Master Prompt Library for Brand Consistency" },
              { title: "Project: Write a Brand Voice Guide + Prompt System for a Real Brand", isProject: true },
            ],
          },
          {
            title: "Module 3: Monetisation — Sell AI Content Services",
            duration: 180,
            topics: [
              {
                title: "Pricing AI Content Retainers: What the Market Pays",
                furtherReading: [
                  { title: "Contra Platform for Freelancers", url: "https://contra.com/", description: "Commission-free freelancing platform — good for AI service providers" },
                ],
              },
              { title: "Structuring Your Offer: Packages, Retainers, and One-Off Projects" },
              { title: "Project: Create a Full Agency Pitch Deck + Pricing Menu for Your AI Content Agency", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 7: DEVELOPER PROFESSIONAL TOOLKIT
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "Developer Professional Toolkit", slug: "developer-professional-toolkit" },
    courses: [
      {
        title: "GitHub: From Zero to Open Source Contributor",
        description: "Set up a professional GitHub profile, master Git workflows, contribute to real open-source projects, and use GitHub Actions for CI/CD.",
        shortDescription: "Git, GitHub, GitHub Actions, and open source contributions.",
        difficulty: "BEGINNER",
        duration: 8,
        price: 0,
        tags: ["github", "git", "open-source", "CI/CD", "beginner"],
        learningOutcomes: [
          "Create and configure a professional GitHub profile with a README",
          "Open a real Pull Request on an open-source repository",
          "Set up a GitHub Actions CI pipeline for automated testing",
        ],
        modules: [
          {
            title: "Module 1: Your Developer Identity on GitHub",
            duration: 120,
            topics: [
              {
                title: "What is Git and Why Every Developer Needs It",
                sourceUrls: ["https://git-scm.com/book/en/v2/Getting-Started-What-is-Git"],
                furtherReading: [
                  { title: "GitHub Docs: Get Started", url: "https://docs.github.com/en/get-started", description: "Official GitHub getting started documentation" },
                  { title: "Awesome GitHub Profile READMEs", url: "https://github.com/abhisheknaiidu/awesome-github-profile-readme", description: "Real examples of great GitHub profiles for inspiration" },
                ],
              },
              { title: "Creating a Professional GitHub Profile README" },
              { title: "Your First Repository: Init, Commit, Push" },
              { title: "Project: Build and Publish a Professional GitHub Profile README", isProject: true },
            ],
          },
          {
            title: "Module 2: Branching, Collaboration & Pull Requests",
            duration: 150,
            topics: [
              {
                title: "Branches: Why They Exist and How to Use Them",
                sourceUrls: ["https://docs.github.com/en/get-started/using-git/about-git"],
              },
              { title: "Your First Pull Request: Step-by-Step" },
              { title: "GitHub Issues: How Professional Teams Track Work" },
              { title: "Project: Fork a Public Repo, Make a Fix, and Open a PR", isProject: true },
            ],
          },
          {
            title: "Module 3: GitHub Pages, CI/CD & Open Source",
            duration: 150,
            topics: [
              {
                title: "Deploying Your Portfolio to GitHub Pages",
                furtherReading: [
                  { title: "GitHub Pages Documentation", url: "https://docs.github.com/en/pages/getting-started-with-github-pages", description: "Official step-by-step guide to GitHub Pages deployment" },
                  { title: "Good First Issues", url: "https://goodfirstissues.com/", description: "Curated beginner-friendly open source issues to contribute to" },
                ],
              },
              {
                title: "GitHub Actions: Automate Tests on Every Push",
                sourceUrls: ["https://docs.github.com/en/actions"],
              },
              { title: "Project: Deploy Portfolio to GitHub Pages + Set Up a CI Workflow", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Google Workspace for Developers",
        description: "Master Google Docs, Sheets, and Drive as a professional productivity stack. Learn Sheets automation with Apps Script.",
        shortDescription: "Docs, Sheets, Drive, and Apps Script automation.",
        difficulty: "BEGINNER",
        duration: 6,
        price: 0,
        tags: ["google-workspace", "sheets", "docs", "automation", "beginner"],
        learningOutcomes: [
          "Write a professional project proposal using Google Docs",
          "Build a personal income tracker in Google Sheets with formulas",
          "Automate a client invoice system with Google Apps Script",
        ],
        modules: [
          {
            title: "Module 1: Google Docs & Drive Mastery",
            duration: 120,
            topics: [
              { title: "Formatting Professional Technical Documents in Google Docs" },
              { title: "Collaborative Editing: Comments, Suggestions, and Version History" },
              { title: "Project: Write a Professional Project Proposal Using Google Docs", isProject: true },
            ],
          },
          {
            title: "Module 2: Google Sheets for Developers",
            duration: 150,
            topics: [
              {
                title: "Formulas Every Developer Needs: VLOOKUP, IF, COUNTIF, SUMIF",
                furtherReading: [
                  { title: "Google Sheets Function List", url: "https://support.google.com/docs/table/25273", description: "Complete list of every Google Sheets function" },
                ],
              },
              { title: "Building a Project Tracker in Sheets" },
              { title: "Project: Build a Personal Income Tracker in Google Sheets", isProject: true },
            ],
          },
          {
            title: "Module 3: Automation with Apps Script",
            duration: 150,
            topics: [
              {
                title: "Google Apps Script: JavaScript for Google Workspace",
                furtherReading: [
                  { title: "Apps Script Quickstart", url: "https://developers.google.com/apps-script/overview", description: "Official quickstart — automate Docs, Sheets, and Gmail with JavaScript" },
                ],
              },
              { title: "Auto-Sending Emails from a Sheet Trigger" },
              { title: "Project: Build an Automated Client Invoice System in Sheets + Apps Script", isProject: true },
            ],
          },
        ],
      },
      {
        title: "LinkedIn: Your Career Command Centre",
        description: "Build a profile recruiters can't ignore, master LinkedIn networking, create content that builds followers, and use AI to grow your professional presence.",
        shortDescription: "Profile mastery, networking, and LinkedIn content that gets noticed.",
        difficulty: "BEGINNER",
        duration: 5,
        price: 0,
        tags: ["linkedin", "personal-branding", "networking", "content", "beginner"],
        learningOutcomes: [
          "Complete a 100% LinkedIn profile that attracts recruiters",
          "Write 5 LinkedIn posts using the hook → value → CTA formula",
          "Build a 30-day AI-powered LinkedIn content calendar",
        ],
        modules: [
          {
            title: "Module 1: Building a Profile Recruiters Can't Ignore",
            duration: 120,
            topics: [
              {
                title: "Profile Photo, Banner, Headline, and About Section",
                furtherReading: [
                  { title: "LinkedIn Profile Optimization Guide", url: "https://www.linkedin.com/help/linkedin/answer/a543895", description: "Official LinkedIn guide to profile optimization" },
                ],
              },
              { title: "Skills, Endorsements, and How LinkedIn's Algorithm Ranks You" },
              { title: "Project: Complete 100% of Your LinkedIn Profile + Connect with 30 People", isProject: true },
            ],
          },
          {
            title: "Module 2: Content That Builds Followers",
            duration: 120,
            topics: [
              { title: "The 3 LinkedIn Post Formats That Get Maximum Reach (Text, Carousels, Video)" },
              { title: "Writing Hooks That Make People Stop Scrolling" },
              { title: "Project: Write and Publish 5 LinkedIn Posts Using the Hook → Value → CTA Formula", isProject: true },
            ],
          },
          {
            title: "Module 3: AI-Powered LinkedIn Growth",
            duration: 120,
            topics: [
              {
                title: "Using AI to Draft Posts, Build a Brand Voice, and Repurpose Content",
                furtherReading: [
                  { title: "LinkedIn Creator Mode Guide", url: "https://www.linkedin.com/help/linkedin/answer/a522537", description: "Turn on Creator Mode to grow your audience and attract opportunities" },
                ],
              },
              { title: "LinkedIn Job Search: Filters, Alerts, and Recruiter Outreach Templates" },
              { title: "Project: Build a 30-Day AI-Powered LinkedIn Content Calendar", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Medium: Become a Recognised Voice in Your Field",
        description: "Write technical articles that build authority, get accepted into top publications, and use AI to research, outline, and polish your posts.",
        shortDescription: "Write, publish, and monetise on Medium.",
        difficulty: "BEGINNER",
        duration: 5,
        price: 0,
        tags: ["medium", "writing", "personal-brand", "publishing", "beginner"],
        learningOutcomes: [
          "Publish a professional Medium article in your technical niche",
          "Get accepted by a Medium publication with 10,000+ followers",
          "Build a content pipeline: Medium → LinkedIn → Newsletter",
        ],
        modules: [
          {
            title: "Module 1: Your First Medium Article",
            duration: 120,
            topics: [
              {
                title: "Setting Up on Medium: Profile, Niche, and Publications",
                furtherReading: [
                  { title: "Medium Help Centre", url: "https://help.medium.com/hc/en-us", description: "Official Medium support and creator documentation" },
                  { title: "Towards Data Science", url: "https://towardsdatascience.com/", description: "The top tech publication on Medium — study their best articles" },
                ],
              },
              { title: "Anatomy of a High-Performing Article: Title, Hook, Structure, CTA" },
              { title: "Project: Write and Publish Your First Medium Article (600+ words)", isProject: true },
            ],
          },
          {
            title: "Module 2: Technical Writing That Gets Shared",
            duration: 120,
            topics: [
              { title: "The Feynman Technique: Explaining Complex Topics Simply" },
              { title: "Writing Code Tutorials: Show Why, Not Just How" },
              { title: "Project: Write a Tutorial Article About Something You Learned This Week", isProject: true },
            ],
          },
          {
            title: "Module 3: Grow, Monetise, and Build Your Brand",
            duration: 120,
            topics: [
              {
                title: "Medium Partner Program: How Writers Get Paid",
                furtherReading: [
                  { title: "Medium Partner Program Overview", url: "https://medium.com/creator-resources/medium-partner-program-overview-9d1bbbc95dbf", description: "How writers earn money through Medium's Partner Program" },
                ],
              },
              { title: "AI-Assisted Writing: Research, Outline, Draft, Polish Without Losing Your Voice" },
              { title: "Project: Build Your Personal Brand Pipeline: Medium → LinkedIn → Newsletter", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 8: MOBILE APP DEVELOPMENT — KOTLIN & ANDROID
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "Kotlin & Android Development", slug: "kotlin-android" },
    courses: [
      {
        title: "Kotlin Quick-Start: 3-Week Android Foundation",
        description: "3 focused weeks. Learn just enough Kotlin and Android fundamentals to start building real apps — then AI takes you to production speed.",
        shortDescription: "3 weeks from zero to your first Android app.",
        difficulty: "BEGINNER",
        duration: 12,
        price: 0,
        tags: ["kotlin", "android", "jetpack-compose", "beginner", "mobile"],
        learningOutcomes: [
          "Write Kotlin code with null safety, data classes, and extension functions",
          "Build a To-Do app UI with Jetpack Compose",
          "Connect an Android app to a real REST API",
        ],
        modules: [
          {
            title: "Week 1: Kotlin Fundamentals",
            duration: 240,
            topics: [
              {
                title: "Variables, Null Safety, and Kotlin's Type System",
                sourceUrls: ["https://kotlinlang.org/docs/basic-syntax.html"],
                furtherReading: [
                  { title: "Kotlin Official Docs", url: "https://kotlinlang.org/docs/home.html", description: "The complete Kotlin reference from JetBrains" },
                  { title: "Kotlin Koans", url: "https://play.kotlinlang.org/koans", description: "Interactive Kotlin exercises directly in the browser — no setup needed" },
                ],
              },
              { title: "Functions, Lambdas, and Extension Functions" },
              { title: "OOP in Kotlin: Classes, Data Classes, Sealed Classes" },
              { title: "Project: Build a Kotlin CLI Task Manager", isProject: true },
            ],
          },
          {
            title: "Week 2: Android Fundamentals with Jetpack Compose",
            duration: 240,
            topics: [
              {
                title: "Android Project Structure and the Activity Lifecycle",
                sourceUrls: ["https://developer.android.com/guide/components/activities/activity-lifecycle"],
                furtherReading: [
                  { title: "Android Developers", url: "https://developer.android.com/develop", description: "Official Android development documentation from Google" },
                ],
              },
              {
                title: "Jetpack Compose: Building UI Declaratively",
                sourceUrls: ["https://developer.android.com/develop/ui/compose/documentation"],
              },
              { title: "Navigation, State, and ViewModel in Compose" },
              { title: "Project: Build a To-Do List App with Jetpack Compose", isProject: true },
            ],
          },
          {
            title: "Week 3: Connecting Apps to the World",
            duration: 240,
            topics: [
              {
                title: "Retrofit for REST API Calls",
                furtherReading: [
                  { title: "Retrofit Documentation", url: "https://square.github.io/retrofit/", description: "The definitive HTTP client for Android apps" },
                ],
              },
              { title: "Room Database for Local Persistence" },
              { title: "Project: Build a Movie Browser App Connected to a Live API", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Kotlin + AI: Build Production Android Apps",
        description: "Use GitHub Copilot, the Gemini API, and Firebase to build complex Android apps rapidly. Ship to the Google Play Store.",
        shortDescription: "Gemini API, Firebase, and shipping to the Play Store.",
        difficulty: "INTERMEDIATE",
        duration: 15,
        price: 0,
        tags: ["kotlin", "android", "gemini", "firebase", "intermediate", "mobile"],
        learningOutcomes: [
          "Integrate the Gemini Vision API into an Android camera app",
          "Build a realtime group messaging app with Firebase",
          "Deploy an app to the Google Play internal testing track",
        ],
        modules: [
          {
            title: "Module 1: AI as Your Android Co-Pilot",
            duration: 240,
            topics: [
              { title: "Using GitHub Copilot for Kotlin: Auto-Complete, Refactoring, Tests" },
              {
                title: "Integrating Google Gemini API into Android",
                sourceUrls: ["https://ai.google.dev/gemini-api/docs/get-started/android"],
                furtherReading: [
                  { title: "Google AI for Android Developers", url: "https://ai.google.dev/gemini-api/docs/get-started/android", description: "Official guide to using Gemini API in Android apps" },
                ],
              },
              { title: "Project: Build an AI Photo Captioner App (Camera → Gemini → Caption)", isProject: true },
            ],
          },
          {
            title: "Module 2: Firebase for Production Features",
            duration: 240,
            topics: [
              {
                title: "Firebase Authentication + Firestore Real-Time Database",
                furtherReading: [
                  { title: "Firebase Android Codelab", url: "https://firebase.google.com/codelabs/firebase-android", description: "Official Firebase Android codelab — hands-on and comprehensive" },
                ],
              },
              { title: "Push Notifications with Firebase Cloud Messaging" },
              { title: "Project: Build a WhatsApp-Style Group Messaging App", isProject: true },
            ],
          },
          {
            title: "Module 3: Ship to Google Play",
            duration: 240,
            topics: [
              {
                title: "Signing, Building an APK/AAB, and Play Store Setup",
                furtherReading: [
                  { title: "Google Play Console Help", url: "https://support.google.com/googleplay/android-developer", description: "Official guide to publishing and managing apps on Google Play" },
                ],
              },
              { title: "In-App Purchases with the Billing Library" },
              { title: "Project: Deploy Your App to the Google Play Internal Testing Track", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 9: MOBILE APP DEVELOPMENT — REACT NATIVE
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "React Native Mobile Development", slug: "react-native-mobile" },
    courses: [
      {
        title: "React Native Quick-Start: 3-Week Mobile Foundation",
        description: "If you know React, you already know 80% of React Native. 3 focused weeks to build cross-platform iOS and Android apps with Expo.",
        shortDescription: "3 weeks from React to iOS + Android apps.",
        difficulty: "BEGINNER",
        duration: 12,
        price: 0,
        tags: ["react-native", "expo", "mobile", "iOS", "Android", "beginner"],
        learningOutcomes: [
          "Build a cross-platform mobile app using Expo",
          "Navigate between screens using React Navigation",
          "Access device features: camera, location, push notifications",
        ],
        modules: [
          {
            title: "Week 1: React Native Mental Model",
            duration: 240,
            topics: [
              {
                title: "React Native vs React Web: What's Different",
                sourceUrls: ["https://reactnative.dev/docs/getting-started"],
                furtherReading: [
                  { title: "Expo Documentation", url: "https://docs.expo.dev/", description: "The best way to start with React Native in 2025 — batteries included" },
                  { title: "React Native Official Docs", url: "https://reactnative.dev/docs/getting-started", description: "Complete React Native documentation from Meta" },
                ],
              },
              { title: "Core Components: View, Text, TextInput, ScrollView, FlatList" },
              { title: "StyleSheet: Styling in React Native" },
              { title: "Project: Build a Mobile Profile Card App", isProject: true },
            ],
          },
          {
            title: "Week 2: Navigation & State",
            duration: 240,
            topics: [
              {
                title: "React Navigation: Stack, Tab, and Drawer Navigators",
                sourceUrls: ["https://reactnavigation.org/docs/getting-started"],
              },
              { title: "Persistent State with AsyncStorage" },
              { title: "Project: Build a 3-Tab Expense Tracker App", isProject: true },
            ],
          },
          {
            title: "Week 3: Device Features & APIs",
            duration: 240,
            topics: [
              {
                title: "Camera, Location, and Push Notifications with Expo",
                furtherReading: [
                  { title: "Expo SDK API Reference", url: "https://docs.expo.dev/versions/latest/", description: "Every Expo API — camera, location, notifications, filesystem" },
                ],
              },
              { title: "Fetching Remote Data from a REST API in React Native" },
              { title: "Project: Build a Location-Based Reminder App", isProject: true },
            ],
          },
        ],
      },
      {
        title: "React Native + AI: Ship to Both Stores",
        description: "Integrate OpenAI into your mobile app, add real-time Supabase data, and ship to both the App Store and Google Play with EAS Build.",
        shortDescription: "OpenAI in mobile + EAS Build for both stores.",
        difficulty: "INTERMEDIATE",
        duration: 14,
        price: 0,
        tags: ["react-native", "openai", "supabase", "eas", "intermediate", "mobile"],
        learningOutcomes: [
          "Integrate OpenAI into a React Native app for AI features",
          "Build a real-time social feature with Supabase",
          "Submit your app to the App Store and Google Play",
        ],
        modules: [
          {
            title: "Module 1: AI Features in React Native",
            duration: 240,
            topics: [
              {
                title: "Integrating OpenAI API into a Mobile App",
                sourceUrls: ["https://platform.openai.com/docs/api-reference"],
              },
              { title: "Building a Streaming Chat Interface in React Native" },
              { title: "Project: Build an AI Voice-to-Text Note-Taking App", isProject: true },
            ],
          },
          {
            title: "Module 2: Auth & Real-Time Data",
            duration: 240,
            topics: [
              {
                title: "Authentication with Clerk or Supabase Auth",
                furtherReading: [
                  { title: "Clerk React Native Quickstart", url: "https://clerk.com/docs/quickstarts/react-native", description: "Add authentication to React Native in under 10 minutes" },
                  { title: "Supabase React Native Guide", url: "https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native", description: "Official Supabase + Expo tutorial" },
                ],
              },
              { title: "Real-Time Data Sync with Supabase Realtime" },
              { title: "Project: Build a Social Feed App with Real-Time Posts", isProject: true },
            ],
          },
          {
            title: "Module 3: EAS Build & App Store Submission",
            duration: 240,
            topics: [
              {
                title: "EAS Build: One Command for iOS + Android",
                sourceUrls: ["https://docs.expo.dev/build/introduction/"],
              },
              { title: "App Store and Google Play Submission Checklist" },
              { title: "Project: Submit Your Capstone App to TestFlight + Play Console Internal Track", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 10: MOBILE APP DEVELOPMENT — FLUTTER & DART
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "Flutter & Dart Mobile Development", slug: "flutter-dart-mobile" },
    courses: [
      {
        title: "Flutter Quick-Start: 3-Week Mobile Foundation",
        description: "Learn Dart and Flutter from scratch in 3 focused weeks. Build beautiful cross-platform apps that run on Android, iOS, and the web.",
        shortDescription: "3 weeks: Dart → Flutter → cross-platform apps.",
        difficulty: "BEGINNER",
        duration: 12,
        price: 0,
        tags: ["flutter", "dart", "mobile", "cross-platform", "beginner"],
        learningOutcomes: [
          "Write Dart code with async/await, classes, and null safety",
          "Build a multi-screen Flutter app with GoRouter navigation",
          "Manage state with Riverpod and fetch live data",
        ],
        modules: [
          {
            title: "Week 1: Dart & Flutter Fundamentals",
            duration: 240,
            topics: [
              {
                title: "Dart in 60 Minutes: Types, Functions, Classes, Async",
                sourceUrls: ["https://dart.dev/language"],
                furtherReading: [
                  { title: "DartPad", url: "https://dartpad.dev/", description: "Write and run Dart in the browser — no setup required" },
                  { title: "Dart Language Tour", url: "https://dart.dev/language", description: "Official Dart language reference" },
                ],
              },
              { title: "Flutter's Widget Tree: Stateless vs Stateful Widgets" },
              { title: "Material Design 3 Components in Flutter" },
              { title: "Project: Build a Flutter Calculator App", isProject: true },
            ],
          },
          {
            title: "Week 2: Layouts & Navigation",
            duration: 240,
            topics: [
              {
                title: "Column, Row, Stack, Container — Flutter's 4 Core Layout Widgets",
                sourceUrls: ["https://docs.flutter.dev/ui/layout"],
                furtherReading: [
                  { title: "Flutter Layout Documentation", url: "https://docs.flutter.dev/ui/layout", description: "Official Flutter layout guide with interactive examples" },
                ],
              },
              {
                title: "GoRouter: Navigation in Modern Flutter Apps",
                furtherReading: [
                  { title: "GoRouter Documentation", url: "https://pub.dev/packages/go_router", description: "The recommended routing package for Flutter in 2025" },
                ],
              },
              { title: "Project: Build a 4-Screen News Reader App", isProject: true },
            ],
          },
          {
            title: "Week 3: State Management & Data",
            duration: 240,
            topics: [
              {
                title: "Riverpod: State Management for Flutter",
                furtherReading: [
                  { title: "Riverpod Documentation", url: "https://riverpod.dev/", description: "The most popular state management solution for Flutter" },
                ],
              },
              { title: "HTTP Requests with the dio Package" },
              { title: "Project: Build a Crypto Price Tracker with Live CoinGecko Data", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Flutter + AI: Rapid Production App Development",
        description: "Integrate Gemini Vision AI, connect Firebase for real-time features, and deploy your Flutter app to both stores.",
        shortDescription: "Gemini API, Firebase, and deploying to both stores.",
        difficulty: "INTERMEDIATE",
        duration: 14,
        price: 0,
        tags: ["flutter", "gemini", "firebase", "intermediate", "mobile"],
        learningOutcomes: [
          "Integrate Gemini Vision API for image recognition in Flutter",
          "Build a real-time collaborative app with Firebase Firestore",
          "Deploy a Flutter app to the Google Play Store",
        ],
        modules: [
          {
            title: "Module 1: AI-Accelerated Flutter Development",
            duration: 240,
            topics: [
              {
                title: "Gemini Vision API in Flutter: Analyse Photos with AI",
                sourceUrls: ["https://ai.google.dev/gemini-api/docs"],
                furtherReading: [
                  { title: "Google AI Dart SDK", url: "https://pub.dev/packages/google_generative_ai", description: "Official Dart/Flutter SDK for the Gemini API" },
                ],
              },
              { title: "Using GitHub Copilot for Flutter Widget Generation" },
              { title: "Project: Build an AI Receipt Scanner App (Photo → Itemized List)", isProject: true },
            ],
          },
          {
            title: "Module 2: Firebase Backend Integration",
            duration: 240,
            topics: [
              {
                title: "Firebase Auth + Firestore + Storage with Flutter",
                furtherReading: [
                  { title: "Flutter Firebase Codelab", url: "https://firebase.google.com/codelabs/firebase-get-to-know-flutter", description: "Official Firebase + Flutter codelab from Google" },
                ],
              },
              { title: "Real-Time Data Sync and Offline Support" },
              { title: "Project: Build a Real-Time Collaborative Shopping List App", isProject: true },
            ],
          },
          {
            title: "Module 3: Build & Deploy",
            duration: 240,
            topics: [
              {
                title: "Building and Signing Your Flutter App for Android",
                sourceUrls: ["https://docs.flutter.dev/deployment/android"],
                furtherReading: [
                  { title: "Flutter Deployment Documentation", url: "https://docs.flutter.dev/deployment/android", description: "Official guide to building and deploying Flutter apps" },
                ],
              },
              { title: "Flutter for iOS: What's Different" },
              { title: "Project: Deploy Your Capstone Flutter App to Google Play", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 11: NEXT.JS & AI WEB DEVELOPMENT
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "Next.js & AI Web Development", slug: "nextjs-ai-webdev" },
    courses: [
      {
        title: "Next.js Foundations",
        description: "Build full-stack web apps with Next.js 15 App Router. Master server components, server actions, Prisma, auth, and deployment to Vercel.",
        shortDescription: "Full-stack React apps with Next.js 15 App Router.",
        difficulty: "INTERMEDIATE",
        duration: 12,
        price: 0,
        tags: ["nextjs", "react", "full-stack", "prisma", "vercel", "intermediate"],
        learningOutcomes: [
          "Build a multi-route Next.js app with dynamic segments and layouts",
          "Fetch data, cache, and revalidate using the App Router patterns",
          "Implement authentication with NextAuth.js and deploy to Vercel",
        ],
        modules: [
          {
            title: "Module 1: The Next.js Mental Model",
            duration: 200,
            topics: [
              {
                title: "App Router vs Pages Router: Why App Router Wins",
                sourceUrls: ["https://nextjs.org/docs/app"],
                furtherReading: [
                  { title: "Next.js Official Documentation", url: "https://nextjs.org/docs", description: "The complete, updated Next.js 15 documentation" },
                ],
              },
              { title: "Server Components vs Client Components: The Most Important Concept" },
              { title: "File-Based Routing: Dynamic Routes, Layouts, Loading, Error" },
              { title: "Project: Build a Multi-Page Blog with Dynamic Routes and MDX", isProject: true },
            ],
          },
          {
            title: "Module 2: Data Fetching & Server Actions",
            duration: 200,
            topics: [
              {
                title: "fetch(), Caching, and Revalidation in Next.js",
                furtherReading: [
                  { title: "Next.js Data Fetching", url: "https://nextjs.org/docs/app/building-your-application/data-fetching", description: "Complete data fetching reference for the App Router" },
                ],
              },
              { title: "Server Actions: The Future of Form Submission" },
              { title: "Database Integration with Prisma + PostgreSQL" },
              { title: "Project: Build a Full-Stack Notes App with Server Actions + PostgreSQL", isProject: true },
            ],
          },
          {
            title: "Module 3: Auth, Deployment & Production",
            duration: 200,
            topics: [
              {
                title: "NextAuth.js: OAuth + Credentials + Session Management",
                sourceUrls: ["https://authjs.dev/getting-started"],
                furtherReading: [
                  { title: "Auth.js Documentation", url: "https://authjs.dev/", description: "The official authentication library for Next.js" },
                ],
              },
              { title: "Deploying to Vercel: The One-Command Deploy" },
              { title: "Project: Ship a Full-Stack Authenticated Web App to Production", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Next.js + AI: Build AI-Native Web Applications",
        description: "Integrate streaming AI chat, build a PDF Q&A RAG system, and deploy a complete AI SaaS product — all in Next.js.",
        shortDescription: "Streaming AI chat, RAG, and a deployed AI SaaS.",
        difficulty: "ADVANCED",
        duration: 15,
        price: 0,
        tags: ["nextjs", "AI", "RAG", "vercel-ai-sdk", "openai", "advanced"],
        learningOutcomes: [
          "Build a streaming AI chat interface using the Vercel AI SDK",
          "Implement a RAG system with vector search and PDF ingestion",
          "Deploy a complete AI SaaS tool to production",
        ],
        modules: [
          {
            title: "Module 1: AI Streaming Features in Next.js",
            duration: 240,
            topics: [
              {
                title: "Vercel AI SDK: Streaming Chat and Tool Calling",
                sourceUrls: ["https://sdk.vercel.ai/docs"],
                furtherReading: [
                  { title: "Vercel AI SDK Documentation", url: "https://sdk.vercel.ai/docs", description: "The recommended way to build AI features in Next.js" },
                ],
              },
              { title: "Streaming Responses: Why and How (SSE, ReadableStream)" },
              { title: "Project: Build Your Own Streaming AI Chat App (Your ChatGPT UI)", isProject: true },
            ],
          },
          {
            title: "Module 2: RAG — Chat With Your Data",
            duration: 240,
            topics: [
              {
                title: "Vector Databases: Supabase pgvector vs Pinecone",
                furtherReading: [
                  { title: "Supabase Vector Store", url: "https://supabase.com/docs/guides/ai/vector-columns", description: "Build RAG directly in your Supabase PostgreSQL database" },
                ],
              },
              { title: "Ingesting PDFs: Parsing, Chunking, and Embedding" },
              { title: "Project: Build a 'Chat With Your PDF' Web App", isProject: true },
            ],
          },
          {
            title: "Module 3: Production AI Apps",
            duration: 240,
            topics: [
              { title: "Rate Limiting, Error Handling, and Cost Control for AI APIs" },
              {
                title: "Monitoring AI in Production: LangSmith and Helicone",
                furtherReading: [
                  { title: "Helicone — AI Observability", url: "https://www.helicone.ai/", description: "Monitor and debug your AI API calls in production" },
                ],
              },
              { title: "Project: Capstone — Build and Deploy a Complete AI SaaS Tool", isProject: true },
            ],
          },
        ],
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════════════
  // TRACK 12: DESKTOP APP DEVELOPMENT
  // ════════════════════════════════════════════════════════════════════════════
  {
    track: { title: "Desktop App Development", slug: "desktop-app-development" },
    courses: [
      {
        title: "Electron.js: Build Desktop Apps with JavaScript",
        description: "If you know web development, you already know 80% of Electron. Build native desktop apps for Windows, macOS, and Linux using HTML, CSS, and JavaScript.",
        shortDescription: "Web dev skills → native Windows, Mac, and Linux apps.",
        difficulty: "INTERMEDIATE",
        duration: 10,
        price: 0,
        tags: ["electron", "desktop", "javascript", "native", "intermediate"],
        learningOutcomes: [
          "Build a desktop app with Electron's Main and Renderer process model",
          "Integrate native OS features: file system, tray, notifications, menus",
          "Package and distribute a desktop app with auto-update capability",
        ],
        modules: [
          {
            title: "Module 1: Electron Fundamentals",
            duration: 200,
            topics: [
              {
                title: "How Electron Works: Main Process vs Renderer Process",
                sourceUrls: ["https://www.electronjs.org/docs/latest/"],
                furtherReading: [
                  { title: "Electron Documentation", url: "https://www.electronjs.org/docs/latest", description: "The complete, official Electron reference" },
                  { title: "Electron Forge", url: "https://www.electronforge.io/", description: "The recommended build toolchain for Electron apps" },
                ],
              },
              { title: "IPC Communication: Sending Messages Between Main and Renderer" },
              { title: "Building Your First Desktop Window with BrowserWindow" },
              { title: "Project: Build a Desktop Markdown Editor", isProject: true },
            ],
          },
          {
            title: "Module 2: Native OS Integration",
            duration: 200,
            topics: [
              { title: "File System Access, System Tray, and Native Dialogs" },
              { title: "Application Menus, Keyboard Shortcuts, and OS Notifications" },
              { title: "Project: Build a Desktop Screenshot Tool with System Tray Icon", isProject: true },
            ],
          },
          {
            title: "Module 3: Packaging & Distribution",
            duration: 200,
            topics: [
              {
                title: "Building .exe (Windows) and .dmg (macOS) from One Codebase",
                furtherReading: [
                  { title: "Electron Builder", url: "https://www.electron.build/", description: "Package and distribute your Electron app for all platforms" },
                ],
              },
              { title: "Auto-Updater: Keep Your App Current" },
              { title: "Project: Package and Distribute a Complete Electron App with Auto-Update", isProject: true },
            ],
          },
        ],
      },
      {
        title: "Tauri: The Modern Electron Alternative",
        description: "10× smaller bundle size, 3× faster startup than Electron. Build desktop apps using Rust + WebView with your existing web frontend.",
        shortDescription: "Rust-powered desktop apps — smaller, faster, more secure.",
        difficulty: "ADVANCED",
        duration: 10,
        price: 0,
        tags: ["tauri", "rust", "desktop", "advanced"],
        learningOutcomes: [
          "Build a Tauri desktop app with a React frontend",
          "Write Rust commands that integrate with the OS",
          "Sign and distribute a production Tauri app via GitHub Releases",
        ],
        modules: [
          {
            title: "Module 1: Tauri Fundamentals",
            duration: 200,
            topics: [
              {
                title: "Why Tauri? Comparing with Electron: Security, Bundle Size, Performance",
                sourceUrls: ["https://tauri.app/v1/guides/"],
                furtherReading: [
                  { title: "Tauri Documentation", url: "https://tauri.app/", description: "The complete Tauri guide — start with the Electron comparison" },
                  { title: "Awesome Tauri", url: "https://github.com/tauri-apps/awesome-tauri", description: "Curated Tauri apps and plugins for inspiration" },
                ],
              },
              { title: "Setting Up Rust + Node + Tauri: Step by Step" },
              { title: "Frontend Integration: Build the UI with React" },
              { title: "Project: Build a Desktop Clipboard Manager with Tauri + React", isProject: true },
            ],
          },
          {
            title: "Module 2: Rust Commands & File System",
            duration: 200,
            topics: [
              { title: "Writing Tauri Commands in Rust: The Bridge Between Frontend and OS" },
              { title: "File System and Shell Access with Tauri Plugins" },
              { title: "Project: Build a Desktop File Organizer App", isProject: true },
            ],
          },
          {
            title: "Module 3: Ship a Production Tauri App",
            duration: 200,
            topics: [
              { title: "Code Signing for Windows and macOS" },
              { title: "Tauri's Built-In Updater" },
              { title: "Project: Ship a Polished Desktop Utility to GitHub Releases", isProject: true },
            ],
          },
        ],
      },
      {
        title: "AI Inside Desktop Apps",
        description: "Run local AI models with Ollama inside Electron apps, call cloud AI APIs securely, and add license key monetisation to your desktop software.",
        shortDescription: "Local AI in desktop apps + monetisation with license keys.",
        difficulty: "ADVANCED",
        duration: 8,
        price: 0,
        tags: ["electron", "AI", "ollama", "openai", "desktop", "advanced"],
        learningOutcomes: [
          "Build a private offline AI writing assistant running entirely locally",
          "Securely call cloud AI APIs from a desktop app",
          "Add a license key system to monetise your desktop software",
        ],
        modules: [
          {
            title: "Module 1: Local AI on Desktop (Offline-First)",
            duration: 200,
            topics: [
              {
                title: "Running Ollama as a Local Backend Inside an Electron App",
                furtherReading: [
                  { title: "Ollama Model Library", url: "https://ollama.com/library", description: "All models available to run locally — LLaMA 3, Mistral, Gemma, Phi" },
                ],
              },
              { title: "Streaming Local LLM Responses to Your Desktop UI" },
              { title: "Project: Build a Private AI Writing Assistant (No Internet Required)", isProject: true },
            ],
          },
          {
            title: "Module 2: Cloud AI in Desktop Apps",
            duration: 200,
            topics: [
              { title: "Storing and Securing API Keys in a Desktop Electron App" },
              { title: "Calling OpenAI and Anthropic APIs from the Main Process" },
              { title: "Project: Build a Desktop AI Document Summarizer", isProject: true },
            ],
          },
          {
            title: "Module 3: Monetising Desktop Apps",
            duration: 200,
            topics: [
              {
                title: "License Key Systems with Lemon Squeezy or Paddle",
                furtherReading: [
                  { title: "Lemon Squeezy for Indie Developers", url: "https://www.lemonsqueezy.com/", description: "The easiest payments platform for software products — no VAT headaches" },
                ],
              },
              { title: "Selling Desktop Apps to Nigerian Schools, SMEs, and Clinics" },
              { title: "Project: Add a License Key Validation System to a Desktop App", isProject: true },
            ],
          },
        ],
      },
    ],
  },
];
