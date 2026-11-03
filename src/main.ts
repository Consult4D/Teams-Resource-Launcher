import { app } from "@microsoft/teams-js";
import { engageUrl } from "./config";
import "./style.css";

const frame = document.querySelector<HTMLIFrameElement>("#engage-frame");
const status = document.querySelector<HTMLParagraphElement>("#status");

if (!frame || !status) {
  throw new Error("The Viva Engage page is missing its frame or status element.");
}

function showError(message: string): void {
  frame!.hidden = true;
  status!.hidden = false;
  status!.textContent = message;
}

async function initialize(): Promise<void> {
  if (new URL(engageUrl).protocol !== "https:") {
    throw new Error("The Viva Engage URL must use HTTPS.");
  }

  await app.initialize();
  frame!.addEventListener("load", () => {
    status!.hidden = true;
  });
  frame!.src = engageUrl;
  frame!.hidden = false;
  app.notifySuccess();
}

void initialize().catch((error: unknown) => {
  showError("Could not load Viva Engage. Please reload the app.");
  console.error("Failed to initialize the Viva Engage app.", error);
});
