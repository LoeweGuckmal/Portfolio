import { site, tags, sections } from "../data/projects.js";
import { getTheme, setTheme, onThemeChange } from "./theme.js";

/* --------------------------------------------------------------------------
   Defaults (used when a project doesn't set its own color / tilt)
   -------------------------------------------------------------------------- */
const PALETTE = ["#e03e3e", "#2d4fa8", "#ee7418", "#1d7f95", "#2f9e44", "#9b6cf0", "#ec5f9a"];
const TILTS = [-2.6, 2.2, -1.2, 2.8, -2, 1.5];
const TAG_TILTS = [-5, 4, -2, 6];
const FALLBACK_TAG_COLOR = "#8a8580";

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

const GITHUB_ICON = `<svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>`;

/* --------------------------------------------------------------------------
   Tiny DOM helper
   -------------------------------------------------------------------------- */
function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "text") node.textContent = value;
    else if (key === "html") node.innerHTML = value;
    else if (key === "style") for (const [p, v] of Object.entries(value)) node.style.setProperty(p, v);
    else node.setAttribute(key, value);
  }
  for (const child of [].concat(children)) if (child) node.append(child);
  return node;
}

/* --------------------------------------------------------------------------
   Data helpers
   -------------------------------------------------------------------------- */
function getTag(key) {
  return tags[key] ?? { label: key, color: FALLBACK_TAG_COLOR };
}

function resolveLink(project) {
  if (project.url) return { href: project.url, owner: null };
  if (!project.repo) return { href: `https://github.com/${site.githubUser}`, owner: null };

  const fullName = project.repo.includes("/") ? project.repo : `${site.githubUser}/${project.repo}`;
  const owner = fullName.split("/")[0];
  const isForeign = owner.toLowerCase() !== site.githubUser.toLowerCase();
  return { href: `https://github.com/${fullName}`, owner: isForeign ? owner : null };
}

/* --------------------------------------------------------------------------
   Rendering
   -------------------------------------------------------------------------- */
function renderCard(project, index) {
  const color = project.color ?? PALETTE[index % PALETTE.length];
  const tilt = project.tilt ?? TILTS[index % TILTS.length];
  const { href, owner } = resolveLink(project);
  const onGitHub = href.includes("github.com");
  const projectTags = project.tags ?? [];

  const tagList = projectTags.length
    ? el(
        "ul",
        { class: "card__tags", "aria-label": "Tags" },
        projectTags.map((key, i) => {
          const tag = getTag(key);
          return el("li", {}, [
            el("span", {
              class: `tag${tag.wiggle ? " tag--wiggle" : ""}`,
              text: tag.label,
              style: { "--t": tag.color, "--tag-tilt": `${TAG_TILTS[i % TAG_TILTS.length]}deg` },
            }),
          ]);
        })
      )
    : null;

  const tech = project.tech?.length
    ? el("ul", { class: "card__tech", "aria-label": "Built with" }, project.tech.map((t) => el("li", { text: t })))
    : el("span");

  const card = el(
    "a",
    {
      class: "card",
      href,
      target: "_blank",
      rel: "noopener noreferrer",
      style: { "--c": color, "--tilt-base": `${tilt}deg` },
    },
    [
      tagList,
      el("div", { class: "card__head" }, [
        el("h3", { class: "card__title", text: project.title }),
        owner ? el("span", { class: "card__owner", text: `@${owner}` }) : null,
      ]),
      project.description ? el("p", { class: "card__desc", text: project.description }) : null,
      el("div", { class: "card__foot" }, [
        tech,
        el("span", { class: "card__link", "aria-hidden": "true" }, [
          onGitHub ? el("span", { html: GITHUB_ICON, style: { display: "inline-flex" } }) : null,
          el("span", { text: onGitHub ? "GitHub" : "Visit" }),
          el("span", { class: "card__arrow", text: "↗" }),
        ]),
      ]),
      el("span", { class: "sr-only", text: onGitHub ? "(opens the GitHub repository in a new tab)" : "(opens in a new tab)" }),
    ]
  );

  return el("li", { "data-tags": projectTags.join(" "), style: { "--i": String(index) } }, [card]);
}

function renderSections(root) {
  sections.forEach((section, sIndex) => {
    const headingId = section.title ? `section-${sIndex}` : null;
    const list = el("ul", { class: "cards", role: "list" }, section.projects.map(renderCard));
    root.append(
      el("section", { class: "section", "aria-labelledby": headingId }, [
        section.title ? el("h2", { class: "section__title", id: headingId, text: section.title }) : null,
        list,
      ])
    );
  });
}

function renderFilter(root) {
  const counts = new Map();
  for (const section of sections)
    for (const project of section.projects)
      for (const key of project.tags ?? []) counts.set(key, (counts.get(key) ?? 0) + 1);

  if (counts.size === 0) return;

  root.append(el("span", { class: "filter__label", text: "filter:" }));

  let active = null;
  const buttons = [];

  const apply = () => {
    for (const b of buttons) b.setAttribute("aria-pressed", String(b.dataset.tag === active));
    for (const li of document.querySelectorAll(".cards > li")) {
      const match = !active || li.dataset.tags.split(" ").includes(active);
      li.classList.toggle("is-dimmed", !match);
    }
  };

  for (const [key, count] of counts) {
    const tag = getTag(key);
    const button = el(
      "button",
      { type: "button", class: "chip", "data-tag": key, "aria-pressed": "false", style: { "--t": tag.color } },
      [document.createTextNode(tag.label), el("span", { class: "chip__count", text: String(count) })]
    );
    button.addEventListener("click", () => {
      active = active === key ? null : key;
      apply();
    });
    buttons.push(button);
    root.append(button);
  }
}

function renderFooter(root) {
  const profile = `https://github.com/${site.githubUser}`;
  root.append(
    el("span", { class: "footer__hand", text: "thanks for stopping by!" }),
    document.createTextNode("More on GitHub: "),
    el("a", { href: profile, target: "_blank", rel: "noopener noreferrer", text: `@${site.githubUser}` })
  );
}

/* --------------------------------------------------------------------------
   Dark mode toggle (defaults to the system setting, see theme.js)
   -------------------------------------------------------------------------- */
function setupThemeToggle(button) {
  const sync = (theme) => {
    const next = theme === "dark" ? "light" : "dark";
    button.dataset.mode = theme;
    button.setAttribute("aria-label", `Switch to ${next} mode`);
    button.title = `Switch to ${next} mode`;
  };
  sync(getTheme());
  onThemeChange(sync);

  button.addEventListener("click", () => {
    const next = getTheme() === "dark" ? "light" : "dark";
    if (reduceMotion || !document.startViewTransition) {
      setTheme(next);
      return;
    }

    // The new theme grows as a circle out of the button.
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    document.startViewTransition(() => setTheme(next)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", pseudoElement: "::view-transition-new(root)" }
      );
    });
  });
}

/* --------------------------------------------------------------------------
   Motion: entrance + subtle 3D tilt on hover
   -------------------------------------------------------------------------- */
function setupEntrance() {
  const items = document.querySelectorAll(".cards > li");
  const settle = (li) => li.addEventListener("transitionend", () => li.classList.add("is-settled"), { once: true });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    items.forEach((li) => li.classList.add("is-in", "is-settled"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        settle(entry.target);
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
  );
  items.forEach((li) => io.observe(li));
}

function setupCardInteractions(background) {
  for (const card of document.querySelectorAll(".card")) {
    const color = card.style.getPropertyValue("--c").trim();

    card.addEventListener("pointerenter", () => background?.focus(color));
    card.addEventListener("pointerleave", () => {
      background?.focus(null);
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });
    card.addEventListener("focus", () => background?.focus(color));
    card.addEventListener("blur", () => background?.focus(null));

    if (!finePointer || reduceMotion) continue;
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--ry", `${(x * 7).toFixed(2)}deg`);
      card.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
    });
  }
}

/* --------------------------------------------------------------------------
   Boot
   -------------------------------------------------------------------------- */
document.title = site.title;
document.getElementById("site-title").textContent = site.title;
document.getElementById("site-tagline").textContent = site.tagline ?? "";

//renderFilter(document.getElementById("tag-filter"));
renderSections(document.getElementById("sections"));
renderFooter(document.getElementById("footer"));
setupThemeToggle(document.getElementById("theme-toggle"));
setupEntrance();

// The three.js background is optional: if it fails to load, the page still works.
const usedColors = [
  ...new Set(sections.flatMap((s) => s.projects.map((p, i) => p.color ?? PALETTE[i % PALETTE.length]))),
];

let background = null;
setupCardInteractions({ focus: (c) => background?.focus(c) });

import("./background.js")
  .then(({ initBackground }) => {
    background = initBackground(document.getElementById("bg"), { colors: usedColors, reduceMotion });
  })
  .catch((error) => console.warn("Background disabled:", error));
