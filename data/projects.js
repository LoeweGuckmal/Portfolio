/* ==========================================================================
   ✏️  CONTENT FILE — this is the only file you need to edit to update the site.
   ==========================================================================

   ADD A PROJECT
   Copy one of the objects in a section's `projects` array and change it:

     {
       title: "My Project",              // required, shown in handwriting
       repo: "my-project",               // repo name → github.com/<githubUser>/my-project
                                         //   or "owner/name" for someone else's repo
       // url: "https://…",              // optional: overrides `repo` with any link
       description: "One or two lines.", // optional
       tech: ["Python", "pygame"],       // optional, small mono text at the bottom
       tags: ["newest", "script"],       // optional, keys from `tags` below
       color: "#e03e3e",                 // optional, card accent (default: palette)
       // tilt: -2,                      // optional, rotation in degrees (default: auto)
     }

   Order in the array = order on the page.
   Repos owned by someone other than `githubUser` automatically show "@owner".

   ADD A TAG
   Add an entry to `tags` and use its key in a project's `tags` array.
   Only tags that are actually used appear in the filter bar.
   ========================================================================== */

export const site = {
  title: "Simon's Projects",
  tagline: "Things I build, tinker with, and occasionally finish.",
  githubUser: "LoeweGuckmal",
};

export const tags = {
  newest: { label: "newest", color: "#6fbf3a", wiggle: true },
  script: { label: "script", color: "#e8a30c" },
  team: { label: "team work", color: "#3d9fe0" },

  // Ready to use — not shown anywhere until a project uses them:
  wip: { label: "work in progress", color: "#9b6cf0" },
  game: { label: "game", color: "#ec5f9a" },
  hardware: { label: "hardware", color: "#d9573b" },
  ai: { label: "AI", color: "#2bb3a3" },
  archived: { label: "archived", color: "#8a8580" },
};

export const sections = [
  {
    title: null, // first section sits directly under the page title
    projects: [
      {
        title: "esp-lights",
        repo: "esp-lights",
        description:
          "ESP32-S3 firmware for my room lights over Wi-Fi: sunrise alarms, a phone presence check and daylight switching.",
        tech: ["C++", "ESP32-S3", "BLE"],
        tags: ["newest"],
        color: "#e03e3e",
      },
      {
        title: "Monopoly AI",
        repo: "MonopolyAI",
        description:
          "Multi-agent reinforcement learning for Monopoly. Agents learn by self-play with PPO in Ray RLlib.",
        tech: ["Python", "RLlib", "Gymnasium"],
        tags: [],
        color: "#2d4fa8",
      },
      {
        title: "Crunchyroll no Hardsubs",
        repo: "crunchyroll-no-hardsubs",
        description:
          "Tampermonkey script that swaps burned-in subtitles on Crunchyroll for the clean stream.",
        tech: ["JavaScript", "Tampermonkey"],
        tags: ["script"],
        color: "#ee7418",
      },
      {
        title: "Fruit Hunt",
        repo: "Fruit-Hunt",
        description:
          "A 1 vs. 1 game. Runs anywhere with Python, or on a Raspberry Pi with a 7-segment display and buzzer.",
        tech: ["Python", "pygame", "Raspberry Pi"],
        tags: ["team"],
        color: "#1d7f95",
      },
    ],
  },
  {
    title: "Other contributions",
    projects: [
      {
        title: "KanjiStart",
        repo: "swagmoneyinc/KanjiStart",
        description:
          "Browser extension that turns the new tab page into a kanji of the day, with dictionary links and custom colors.",
        tech: ["JavaScript", "Browser extension"],
        tags: [],
        color: "#2f9e44",
      },
    ],
  },
];
