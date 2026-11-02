import { app } from "@microsoft/teams-js";
import { resourceUrl } from "./config";
import "./style.css";

function requireElement<T extends Element>(
  element: T | null,
  description: string,
): T {
  if (!element) {
    throw new Error(`The resource launcher page is missing its ${description}.`);
  }
  return element;
}

const openButton = requireElement(
  document.querySelector<HTMLButtonElement>("#open-resource"),
  "open button",
);
const status = requireElement(
  document.querySelector<HTMLParagraphElement>("#status"),
  "status message",
);

function isValidResourceUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.hostname.toLowerCase().includes("replace-with")
    );
  } catch {
    return false;
  }
}

async function initialize(): Promise<void> {
  if (!isValidResourceUrl(resourceUrl)) {
    status.textContent =
      "Set the resource URL in src/config.ts before building the app.";
    return;
  }

  await app.initialize();
  openButton.disabled = false;
  status.textContent = "Ready to open your configured resource.";
}

openButton.addEventListener("click", async () => {
  openButton.disabled = true;
  status.textContent = "Opening your resource…";

  try {
    await app.openLink(resourceUrl);
  } catch (error) {
    openButton.disabled = false;
    status.textContent = "Teams could not open the resource. Please try again.";
    console.error("Failed to open the configured resource.", error);
  }
});

void initialize().catch((error: unknown) => {
  status.textContent = "Could not initialize the Teams app. Please reload it.";
  console.error("Failed to initialize the Teams app.", error);
});
