export const CURRICULUM = [
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
        modules: [
          {
            title: "Module 1: The Tech Anatomy",
            duration: 120, // minutes
            topics: [
              { title: "Hardware vs Software: The Brain and the Body" },
              { title: "How the Internet Works: Servers and Clients", externalUrl: "https://www.youtube.com/watch?v=7_LPdttKXPc" }
            ]
          },
          {
            title: "Module 2: Soft Skills in Tech",
            duration: 120,
            topics: [
              { title: "Effective Communication for Developers" },
              { title: "Computational Thinking: Breaking Big Problems into Small Steps" }
            ]
          }
        ]
      },
      {
        title: "AI as a Partner",
        description: "Learn how to use AI as a highly capable intern rather than a magic trick.",
        shortDescription: "Introduction to LLMs and Prompt Engineering.",
        difficulty: "BEGINNER",
        duration: 4,
        price: 0,
        modules: [
          {
            title: "Module 1: Meet Your AI Intern",
            duration: 60,
            topics: [
              { title: "What are Large Language Models?" },
              { title: "Hallucinations and Fact-Checking" }
            ]
          },
          {
            title: "Module 2: Prompt Engineering 101",
            duration: 120,
            topics: [
              { title: "The Role + Task + Context Formula" },
              { title: "Iterative Prompting for Better Results" }
            ]
          }
        ]
      }
    ]
  },
  {
    track: { title: "Frontend Development", slug: "frontend-development" },
    courses: [
      {
        title: "HTML Foundations: The Bones of the Web",
        description: "Learn the core structure of the web by building your first web pages from scratch.",
        shortDescription: "Master HTML semantics without AI help (yet).",
        difficulty: "BEGINNER",
        duration: 8,
        price: 0,
        modules: [
          {
            title: "Module 1: Getting Started",
            duration: 120,
            topics: [
              { title: "What is HTML and the DOM?", externalUrl: "https://www.freecodecamp.org/learn/2022/responsive-web-design/" },
              { title: "Basic Tags and Nesting" },
              { title: "Images and Links" }
            ]
          },
          {
            title: "Module 2: Structure and Semantics",
            duration: 180,
            topics: [
              { title: "Building Forms to Collect Data" },
              { title: "Semantic HTML: Header, Main, Footer" },
              { title: "Project: Personal Profile Page", isProject: true }
            ]
          }
        ]
      },
      {
        title: "CSS Mastery: The Skin of the Web",
        description: "Style your foundational HTML with colors, layouts, and typography.",
        shortDescription: "Learn Flexbox, Grid, and the Cascade.",
        difficulty: "BEGINNER",
        duration: 10,
        price: 0,
        modules: [
          {
            title: "Module 1: Styling Basics",
            duration: 120,
            topics: [
              { title: "The Box Model" },
              { title: "Understanding the Cascade and Specificity" }
            ]
          },
          {
            title: "Module 2: Modern Layouts",
            duration: 200,
            topics: [
              { title: "Flexbox Fundamentals" },
              { title: "CSS Grid for Advanced Layouts" },
              { title: "Responsive Design and Media Queries" }
            ]
          }
        ]
      },
      {
        title: "Vanilla JavaScript: The Engine",
        description: "Add interactivity to your static pages with pure JavaScript.",
        shortDescription: "Logic, events, and true programming.",
        difficulty: "INTERMEDIATE",
        duration: 15,
        price: 0,
        modules: [
          {
            title: "Module 1: Core Logic",
            duration: 180,
            topics: [
              { title: "Variables and Data Types" },
              { title: "Functions and Scope" },
              { title: "If/Else Statements and Loops" }
            ]
          },
          {
            title: "Module 2: The Browser Interface",
            duration: 200,
            topics: [
              { title: "Manipulating the DOM" },
              { title: "Listening for Events (Clicks, Inputs)" }
            ]
          }
        ]
      },
      {
        title: "React Fundamentals",
        description: "Move from manual DOM updates to modern component-based architecture.",
        shortDescription: "The industry standard for UIs.",
        difficulty: "INTERMEDIATE",
        duration: 12,
        price: 0,
        modules: [
          {
            title: "Module 1: The React Mental Model",
            duration: 150,
            topics: [
              { title: "What are Components?" },
              { title: "JSX: Combining HTML and JS" }
            ]
          },
          {
            title: "Module 2: Managing Change",
            duration: 180,
            topics: [
              { title: "State Updates with useState" },
              { title: "Side Effects with useEffect" }
            ]
          }
        ]
      }
    ]
  }
];
