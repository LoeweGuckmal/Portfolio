# Simon's Projects

A small, static portfolio site that lists my projects and links each card to its GitHub repo.
No build step: plain HTML/CSS/JS, with [three.js](https://threejs.org) for the floating background shapes.

## Updating content

Everything you'd normally change lives in **[`data/projects.js`](data/projects.js)**:

- `site`: page title, tagline, GitHub username
- `tags`: available tags (label + color, optional `wiggle`)
- `sections`: the sections and their projects, in display order

A project looks like this:

```js
{
  title: "My Project",
  repo: "my-project",              // → github.com/<githubUser>/my-project
                                   //   or "owner/name" for someone else's repo (shows "@owner")
  description: "One or two lines.",
  tech: ["Python", "pygame"],
  tags: ["newest"],
  color: "#e03e3e",                // optional
}
```

To add a tag, add it to `tags` and use its key in a project. Only tags that are used show up in the filter bar.

## Structure

```
index.html          page shell
data/projects.js    ✏️ content: site info, tags, projects
css/style.css       styles (light + dark, responsive, reduced motion)
js/main.js          renders cards, tag filter, entrance + hover tilt, theme toggle
js/theme.js         light/dark theme: follows the system until the toggle overrides it
js/background.js    three.js background (optional; the page works without it)
```