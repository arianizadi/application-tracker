import type { Preset } from "../types";

export const SOFTWARE_PRESETS: Preset[] = [
  {
    key: "swe",
    track: "software",
    label: "Software Engineering",
    blurb: "Languages, web and APIs, CS foundations, testing and shipping.",
    categories: [
      {
        id: "languages",
        label: "Languages",
        kind: "languages",
        tip: "Name the language used in a real project and what you built with it.",
        terms: [
          ["Python", 3],
          ["Java", 3],
          ["JavaScript", 3],
          ["TypeScript", 2],
          ["C++", 2],
          ["Go", 1],
          ["SQL", 2],
        ],
      },
      {
        id: "web",
        label: "Web & APIs",
        kind: "tools",
        tip: "Describe an interface or endpoint you implemented, and who used it.",
        terms: [
          ["React", 2],
          ["Node.js", 2],
          ["REST APIs", 2],
          ["HTML", 1],
          ["CSS", 1],
        ],
      },
      {
        id: "foundations",
        label: "Foundations",
        kind: "concepts",
        tip: "Give a specific problem, bug or tradeoff: 'cut lookup time from O(n) to O(1) with a hash map'.",
        terms: [
          ["Data structures", 2],
          ["Algorithms", 2],
          ["Object-oriented programming", 2],
          ["Debugging", 2],
          ["Problem solving", 1],
          ["System design", 1],
          ["Databases", 1],
        ],
      },
      {
        id: "quality",
        label: "Quality",
        kind: "skills",
        tip: "Explain how you checked that your work functioned: tests, reviews, a pipeline.",
        terms: [
          ["Unit testing", 2],
          ["Integration testing", 1],
          ["Code review", 2],
          ["CI/CD", 2],
          ["Test-driven development", 1],
        ],
      },
      {
        id: "tools",
        label: "Tools & infrastructure",
        kind: "tools",
        tip: "Put relevant tools beside the project that used them rather than in a long list.",
        terms: [
          ["Git", 2],
          ["Linux", 2],
          ["Docker", 2],
          ["AWS", 2],
        ],
      },
      {
        id: "delivery",
        label: "Delivery",
        kind: "soft",
        tip: "Describe something you made easier to ship, use or maintain.",
        terms: [
          ["Agile", 1],
          ["Collaboration", 1],
          ["Documentation", 1],
          ["Performance optimization", 1],
          ["Accessibility", 1],
        ],
      },
    ],
  },
];
