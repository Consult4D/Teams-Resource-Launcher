import { app } from "@microsoft/teams-js";
import { engageUrl, resourceUrl } from "./config";
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

function isValidHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.hostname.includes("replace-with");
  } catch {
    return false;
  }
}

async function initializeLauncher(): Promise<void> {
  const status = requireElement(
    document.querySelector<HTMLParagraphElement>("#status"),
    "status message",
  );
  const openButton = requireElement(
    document.querySelector<HTMLButtonElement>("#open-resource"),
    "open button",
  );

  if (!isValidHttpsUrl(resourceUrl)) {
    status.textContent =
      "Set the resource URL in src/config.ts before building the app.";
    return;
  }

  await app.initialize();
  openButton.disabled = false;
  status.textContent = "Ready to open your configured resource.";
}

async function initializeEngageTest(): Promise<void> {
  if (!isValidHttpsUrl(engageUrl)) {
    throw new Error("The Viva Engage test URL must be a valid HTTPS URL.");
  }

  document.body.className = "engage-test";
  const page = document.createElement("main");
  page.className = "engage-test-page";

  const header = document.createElement("header");
  header.className = "engage-test-header";

  const label = document.createElement("strong");
  label.textContent = "Viva Engage embed test";

  const status = document.createElement("span");
  status.className = "engage-test-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = "Connecting to Microsoft Teams…";

  const externalLink = document.createElement("a");
  externalLink.href = engageUrl;
  externalLink.target = "_blank";
  externalLink.rel = "noopener noreferrer";
  externalLink.textContent = "Open in browser";

  header.append(label, status, externalLink);

  const frame = document.createElement("iframe");
  frame.className = "engage-test-frame";
  frame.title = "Parent tenant Viva Engage";
  frame.referrerPolicy = "strict-origin-when-cross-origin";
  frame.addEventListener("load", () => {
    status.textContent =
      "The frame loaded. Verify that the parent tenant’s Engage content is visible.";
  });
  frame.src = engageUrl;

  page.append(header, frame);
  document.body.replaceChildren(page);

  await app.initialize();
  status.textContent =
    "If the frame is blank or shows an error, Engage may block embedding or sign-in in Teams.";
}

async function openResource(): Promise<void> {
  const openButton = requireElement(
    document.querySelector<HTMLButtonElement>("#open-resource"),
    "open button",
  );
  const status = requireElement(
    document.querySelector<HTMLParagraphElement>("#status"),
    "status message",
  );

  openButton.disabled = true;
  status.textContent = "Opening your resource…";

  try {
    await app.openLink(resourceUrl);
  } catch (error) {
    openButton.disabled = false;
    status.textContent = "Teams could not open the resource. Please try again.";
    console.error("Failed to open the configured resource.", error);
  }
}

const isEngageTest = new URLSearchParams(window.location.search).get("mode") ===
  "engage-test";

if (isEngageTest) {
  void initializeEngageTest().catch((error: unknown) => {
    document.body.textContent =
      "Could not initialize the Viva Engage embed test. Please reload it.";
    console.error("Failed to initialize the Viva Engage embed test.", error);
  });
} else {
  const openButton = requireElement(
    document.querySelector<HTMLButtonElement>("#open-resource"),
    "open button",
  );
  openButton.addEventListener("click", () => void openResource());

  void initializeLauncher().catch((error: unknown) => {
    const status = document.querySelector<HTMLParagraphElement>("#status");
    if (status) {
      status.textContent =
        "Could not initialize the Teams app. Please reload it.";
    }
    console.error("Failed to initialize the Teams app.", error);
  });
}
