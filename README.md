# Montar App

Load Faster. Move more cars.

## Running in GitHub Codespaces

1. Open this repo on GitHub and click **Code → Codespaces → Create codespace on main**.
2. Wait for the container to build — `npm install` runs automatically.
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. A notification will pop up asking to open the forwarded port. Click **Open in Browser**.
   - If it doesn't appear, go to the **Ports** tab (bottom panel), find port `5173`, and click the globe icon.

## Running Locally

Make sure you have [Node.js 20+](https://nodejs.org) installed, then:

```bash
# Install dependencies
npm install

# Start the dev server (opens at http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

## Saving your work with Git

After making changes in Codespaces, save them to GitHub:

```bash
# See what changed
git status

# Stage all changes
git add .

# Commit with a short description
git commit -m "describe what you changed"

# Push to GitHub
git push
```

## Project Structure

```
montar-app/
├── index.html          # The full app (HTML + CSS + JS, all-in-one)
├── manifest.webmanifest  # PWA manifest (makes it installable)
├── icon.svg            # App icon
├── vite.config.js      # Vite build configuration
├── package.json        # Project dependencies and scripts
└── .devcontainer/
    └── devcontainer.json  # GitHub Codespaces configuration
```
