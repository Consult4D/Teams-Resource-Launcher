const configuredEngageUrl = import.meta.env.VITE_ENGAGE_URL?.trim();

if (!configuredEngageUrl) {
  throw new Error("VITE_ENGAGE_URL must be set in .env.local or the build environment.");
}

export const engageUrl = configuredEngageUrl;
