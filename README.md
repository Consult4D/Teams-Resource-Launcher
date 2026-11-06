# Teams Resource Launcher

A custom Microsoft Teams personal app that displays one configured Viva Engage
network inside a Teams tab. It was built to show a parent tenant's Engage
network to users of a child tenant in a multitenant organization, without
leaving Teams. The Engage site must allow framing and sign-in inside Teams;
this was verified for the parent network configured here.

## Configure the app

1. Copy `.env.example` to `.env.local` and set `VITE_ENGAGE_URL` to the Viva
   Engage network's full HTTPS URL. `.env.local` is ignored by Git.
2. Edit `public/manifest.json`:
   - Set `id` to a new GUID.
   - Set the organization and public website, privacy, and terms URLs.
   - The GitHub Pages URLs are already set for this repository:
     `https://consult4d.github.io/Teams-Resource-Launcher/`. Keep
     `consult4d.github.io` and the host from `VITE_ENGAGE_URL` in
     `validDomains`.
   - Increase `version` whenever you resubmit the app.
3. Replace the sample `public/color.png` and `public/outline.png` with your
   branded Teams app icons before submission. Teams requires a 192x192 color
   icon and a 32x32 transparent outline icon.

For GitHub Pages deployments, add a repository Actions secret named
`VITE_ENGAGE_URL` under **Settings → Secrets and variables → Actions**. The
deployment workflow uses it when building the site. Never put a customer URL
in tracked source files or commit `.env.local`.

## Deploy to GitHub Pages

The GitHub Actions workflow deploys the site to GitHub Pages whenever changes
are pushed to `main`. To enable it, open the repository's **Settings → Pages**
and set **Build and deployment → Source** to **GitHub Actions**. Merge the
deployment setup into `main`; then check the **Actions** tab for a successful
deployment. The published site URL is
`https://consult4d.github.io/Teams-Resource-Launcher/`.

The Teams manifest must use that published URL, and its `validDomains` entry
must be the hostname only: `consult4d.github.io`.

## Build

Requires Node.js 20 or later.

```powershell
npm install
npm run build
```

The production site is written to `dist/`. GitHub Pages hosts that directory
at the HTTPS URL configured in `public/manifest.json`. The URL is embedded in
the generated client-side bundle so the browser can open it. An Actions secret
keeps it out of repository source, but does not hide it from visitors to the
public site. Use private/authenticated hosting if the URL must be confidential.

## Package for Teams

After building and hosting the site, create a Teams app package ZIP containing
the configured `manifest.json` and the two PNG icons at the ZIP root. Use the
same app ID and hosted HTTPS origin in the manifest. Validate the package with
the [Teams Developer Portal](https://dev.teams.microsoft.com/) before
submitting it to your organization's app catalog or the Teams Store.

On Windows, run `npm run package` after `npm run build`. The script reads
`VITE_ENGAGE_URL` from `.env.local` or the environment, checks for the
required deployment settings, and writes
`dist/teams-resource-launcher.zip`.

Store submission also requires organization-specific branding, legal URLs, and
Microsoft's current app validation and publishing requirements. Those details
cannot be completed until the publisher and hosting information are known.
