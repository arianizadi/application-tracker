import type { Preset } from "../types";

export const DATA_PRESETS: Preset[] = [
  {
    key: "data-science",
    track: "data",
    label: "Data Science",
    blurb: "Data handling, statistics, modeling practice and clear communication.",
    categories: [
      {
        id: "handling",
        label: "Data handling",
        kind: "languages",
        tip: "Explain the dataset and one cleaning decision you made (and why).",
        terms: [
          ["Python", 3],
          ["SQL", 3],
          ["pandas", 2],
          ["NumPy", 2],
          ["Data cleaning", 2],
          ["R", 1],
        ],
      },
      {
        id: "stats",
        label: "Statistics",
        kind: "concepts",
        tip: "Connect the method to the question it answered.",
        terms: [
          ["Hypothesis testing", 2],
          ["Regression", 2],
          ["Probability", 2],
          ["Statistical inference", 2],
          ["A/B testing", 2],
        ],
      },
      {
        id: "modeling",
        label: "Modeling practice",
        kind: "skills",
        tip: "Name the evaluation method and metric when you have one.",
        terms: [
          ["Machine learning", 3],
          ["Supervised learning", 1],
          ["Unsupervised learning", 1],
          ["Feature engineering", 2],
          ["Model evaluation", 2],
          ["Cross-validation", 1],
          ["Deep learning", 1],
        ],
      },
      {
        id: "tools",
        label: "Tools",
        kind: "tools",
        tip: "Attach tools to an actual analysis rather than listing them alone.",
        terms: [
          ["scikit-learn", 2],
          ["Jupyter", 1],
          ["Git", 1],
          ["matplotlib", 1],
          ["seaborn", 1],
          ["Tableau", 1],
        ],
      },
      {
        id: "applications",
        label: "Applications",
        kind: "concepts",
        tip: "Highlight the project closest to this role first.",
        terms: [
          ["Classification", 1],
          ["Clustering", 1],
          ["Forecasting", 1],
          ["Natural language processing", 1],
          ["Recommendation systems", 1],
        ],
      },
      {
        id: "communication",
        label: "Research & communication",
        kind: "soft",
        tip: "Explain a finding and why it mattered to someone.",
        terms: [
          ["Experimental design", 1],
          ["Reproducibility", 1],
          ["Dashboards", 1],
          ["Stakeholder communication", 1],
          ["Data storytelling", 1],
        ],
      },
    ],
  },
];
