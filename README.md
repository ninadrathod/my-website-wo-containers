# Portfolio Website

A static personal portfolio site built with HTML, CSS, and vanilla JavaScript. All content is loaded from local JSON files—no build step, no backend, and no Docker required.

## Directory Overview

| Path | Purpose |
|------|---------|
| `index.html` | Main page shell (header, tabs, loader) |
| `script.js` | Fetches JSON data and renders the UI |
| `my_info_tab_content.html` | Resume tab layout (work, education, projects, etc.) |
| `src/output.css` | Compiled Tailwind styles |
| `src/input.css` | Tailwind source (edit styles here, then rebuild CSS if needed) |
| `icons/` | SVG icons for social links and UI |
| `backend/metadata.json` | Profile info (name, summary, links) |
| `backend/data.json` | Resume sections (experience, education, skills, etc.) |

## Run Locally

The site uses the Fetch API to load JSON, so open it through a local web server (not `file://`):

```bash
# From the project root
python3 -m http.server 8080
```

Then visit [http://localhost:8080](http://localhost:8080).

## Deploy on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Choose the `main` branch and the `/ (root)` folder, then save.
5. After a minute or two, the site will be live at `https://<username>.github.io/<repo>/`.

To use a custom domain, add it under **Pages → Custom domain** in the same settings panel.

## Updating Content

Edit `backend/metadata.json` for profile fields (name, summary, email, links) and `backend/data.json` for resume sections. Each entry in `data.json` uses a `category` field to group items (e.g. `work_exp`, `education`, `projects`).
