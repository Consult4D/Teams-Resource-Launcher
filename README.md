# Teams Resource Launcher

A custom Microsoft Teams personal app that opens one configured HTTPS resource
through the Teams link handler. This keeps the destination out of an embedded
frame and lets Teams and the user's device handle the link on desktop and
mobile.

## Configure the app

1. Edit `src/config.ts` and replace the example value with the resource's full
   HTTPS URL.
2. Edit `public/manifest.json`:
   - Set `id` to a new GUID.
   - Set the organization and public website, privacy, and terms URLs.
   - Replace `your-app-host.example.com` with the HTTPS hostname where this
     app's built files will be hosted. Do not include a scheme or path in
     `validDomains`.
3. Replace the sample `public/color.png` and `public/outline.png` with your
   branded Teams app icons before submission. Teams requires a 192x192 color
   icon and a 32x32 transparent outline icon.

The configured resource URL is fixed in the app build. Changing it requires
rebuilding and redeploying the app.

## Build

Requires Node.js 20 or later.

```powershell
npm install
npm run build
```

The production site is written to `dist/`. Host that directory at the HTTPS
origin configured in `public/manifest.json`. The host must allow the site to be
embedded in Microsoft Teams; the app itself uses TeamsJS `pages.currentApp.navigateToApp`
to launch the destination rather than embedding the destination.

## Package for Teams

After building and hosting the site, create a Teams app package ZIP containing
the configured `manifest.json` and the two PNG icons at the ZIP root. Use the
same app ID and hosted HTTPS origin in the manifest. Validate the package with
the [Teams Developer Portal](https://dev.teams.microsoft.com/) before
submitting it to your organization's app catalog or the Teams Store.

On Windows, run `npm run package` after `npm run build`. The script checks for
the required deployment settings and writes
`dist/teams-resource-launcher.zip`.

Store submission also requires organization-specific branding, legal URLs, and
Microsoft's current app validation and publishing requirements. Those details
cannot be completed until the publisher and hosting information are known.
